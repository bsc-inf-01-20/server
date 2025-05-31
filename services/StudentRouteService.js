const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class StudentRouteService {
  async createOrUpdateMany(routes) {
    const results = {
      createdCount: 0,
      updatedCount: 0,
      errors: []
    };

    for (const route of routes) {
      try {
        const routeData = this.prepareRouteData(route);
        
        // Using separate find + create/update instead of upsert
        const existing = await prisma.studentRoute.findFirst({
          where: {
            studentId: routeData.studentId,
            schoolId: routeData.schoolId,
            travelMode: routeData.travelMode
          }
        });

        if (existing) {
          await prisma.studentRoute.update({
            where: { id: existing.id },
            data: routeData
          });
          results.updatedCount++;
        } else {
          await prisma.studentRoute.create({
            data: routeData
          });
          results.createdCount++;
        }
      } catch (error) {
        results.errors.push({
          route: { 
            studentId: route?.studentId,
            schoolId: route?.schoolId 
          },
          error: error.message
        });
      }
    }

    return results;
  }

  prepareRouteData(route) {
    return {
      studentId: route.studentId,
      studentName: route.studentName || 'Unknown',
      schoolId: route.schoolId,
      schoolName: route.schoolName || 'Unknown',
      travelMode: route.travelMode || 'walking',
      distance: parseFloat(route.distance) || 0,
      duration: parseInt(route.duration) || 0,
      coordinates: route.coordinates || {
        student: [0, 0],
        school: [0, 0]
      },
      academicYear: route.academicYear || this.getAcademicYear(),
      division: route.division || 'Unknown',
      district: route.district || 'Unknown',
      zone: route.zone || 'Unknown',
      polyline: route.polyline || null
    };
  }

  getAcademicYear() {
    const year = new Date().getFullYear();
    return `${year}-${year + 1}`;
  }
}

module.exports = new StudentRouteService();