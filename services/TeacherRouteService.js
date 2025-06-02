const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class TeacherRouteService {
  async createOrUpdateMany(routes) {
    const results = {
      createdCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errors: []
    };

    // Process routes in batches for better performance
    const BATCH_SIZE = 100;
    for (let i = 0; i < routes.length; i += BATCH_SIZE) {
      const batch = routes.slice(i, i + BATCH_SIZE);
      
      try {
        const batchResults = await this.processBatch(batch);
        results.createdCount += batchResults.createdCount;
        results.updatedCount += batchResults.updatedCount;
        results.skippedCount += batchResults.skippedCount;
        results.errors.push(...batchResults.errors);
      } catch (error) {
        results.errors.push({
          error: `Batch processing failed: ${error.message}`,
          batchIndex: i
        });
      }
    }

    return results;
  }

  async processBatch(routes) {
    const batchResults = {
      createdCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errors: []
    };

    // First validate all routes in the batch
    const validatedRoutes = routes.map(route => {
      try {
        return this.validateRoute(route);
      } catch (error) {
        batchResults.errors.push({
          route: { teacherId: route?.teacherId, schoolId: route?.schoolId },
          error: error.message
        });
        batchResults.skippedCount++;
        return null;
      }
    }).filter(Boolean);

    if (validatedRoutes.length === 0) {
      return batchResults;
    }

    // Process valid routes
    for (const route of validatedRoutes) {
      try {
        const existing = await prisma.teacherRoute.findFirst({
          where: {
            teacherId: route.teacherId,
            schoolId: route.schoolId,
            academicYear: route.academicYear
          }
        });

        if (existing) {
          await prisma.teacherRoute.update({
            where: { id: existing.id },
            data: route
          });
          batchResults.updatedCount++;
        } else {
          await prisma.teacherRoute.create({
            data: route
          });
          batchResults.createdCount++;
        }
      } catch (error) {
        batchResults.errors.push({
          route: { teacherId: route.teacherId, schoolId: route.schoolId },
          error: error.message
        });
        batchResults.skippedCount++;
      }
    }

    return batchResults;
  }

  validateRoute(route) {
    if (!route.teacherId || !route.schoolId) {
      throw new Error("Missing required teacherId or schoolId");
    }

    return {
      teacherId: String(route.teacherId),
      teacherName: String(route.teacherName || 'Unknown Teacher'),
      teacherCode: route.teacherCode ? String(route.teacherCode) : null,
      specialization: route.specialization ? String(route.specialization) : null,
      schoolId: String(route.schoolId),
      schoolName: String(route.schoolName || 'Unknown School'),
      travelMode: this.validateTravelMode(route.travelMode),
      distance: this.validateDistance(route.distance),
      duration: this.validateDuration(route.duration),
      coordinates: this.validateCoordinates(route.coordinates),
      polyline: route.polyline ? String(route.polyline) : null,
      academicYear: route.academicYear || this.getAcademicYear(),
      division: String(route.division || 'Unknown'),
      district: String(route.district || 'Unknown'),
      zone: String(route.zone || 'Unknown')
    };
  }

  validateTravelMode(mode) {
    const validModes = ['walking', 'driving', 'bicycling', 'transit'];
    return validModes.includes(mode) ? mode : 'walking';
  }

  validateDistance(distance) {
    const dist = parseFloat(distance);
    return isNaN(dist) ? 0 : Math.max(0, dist);
  }

  validateDuration(duration) {
    const dur = parseInt(duration);
    return isNaN(dur) ? 0 : Math.max(0, dur);
  }

  validateCoordinates(coords) {
    const defaultCoords = {
      teacher: [0, 0],
      school: [0, 0]
    };

    if (!coords) return defaultCoords;

    return {
      teacher: Array.isArray(coords.teacher) && coords.teacher.length === 2 ?
        coords.teacher.map(Number) : defaultCoords.teacher,
      school: Array.isArray(coords.school) && coords.school.length === 2 ?
        coords.school.map(Number) : defaultCoords.school
    };
  }

  getAcademicYear() {
    const year = new Date().getFullYear();
    return `${year}-${year + 1}`;
  }
}

module.exports = new TeacherRouteService();