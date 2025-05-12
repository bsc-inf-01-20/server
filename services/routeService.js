const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saveBulkRoutes = async (routes) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // First delete any existing routes for these school-place pairs
      await tx.route.deleteMany({
        where: {
          OR: routes.map(route => ({
            schoolId: route.schoolId,
            placeId: route.placeId
          }))
        }
      });

      // Then create new records
      const created = await tx.route.createMany({
        data: routes.map(route => ({
          schoolId: route.schoolId,
          schoolName: route.schoolName,
          travelMode: route.travelMode,
          place: route.place,
          amenityType: route.amenityType,
          distance: route.distance,
          duration: route.duration,
          durationDisplay: route.timeDisplay,
          schoolCoords: route.schoolCoords,
          placeCoords: route.placeCoords,
          location: route.location,
          overviewPolyline: route.overviewPolyline,
          placeId: route.placeId,
          bounds: JSON.stringify(route.bounds),
          steps: JSON.stringify(route.steps),
          rawData: JSON.stringify(route.rawData),
          createdAt: new Date()
        })),
        skipDuplicates: true
      });

      // Return the actual created records
      return await tx.route.findMany({
        where: {
          OR: routes.map(route => ({
            schoolId: route.schoolId,
            placeId: route.placeId
          }))
        }
      });
    });
  } catch (error) {
    console.error('Bulk save error:', error);
    throw {
      status: 500,
      message: 'Failed to save routes to MongoDB',
      failures: routes
    };
  }
};

module.exports = {
  saveBulkRoutes
};