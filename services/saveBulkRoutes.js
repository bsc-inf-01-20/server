const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saveBulkRoutes = async (routes) => {
  let transaction;
  try {
    transaction = await prisma.$transaction(async (tx) => {
      // Validate and transform routes
      const validRoutes = routes
        .map((route, index) => {
          // Validate required fields
          if (!route.schoolId || !route.place || typeof route.distance !== 'number') {
            console.warn(`Invalid route at index ${index}`, {
              schoolId: route.schoolId,
              place: route.place,
              distance: route.distance
            });
            return null;
          }
          return route;
        })
        .filter(Boolean);

      if (validRoutes.length === 0) {
        throw {
          status: 400,
          message: 'No valid routes provided',
          details: {
            requiredFields: ['schoolId', 'place', 'distance'],
            receivedCount: routes.length,
            validCount: 0
          }
        };
      }

      // Delete existing routes matching schoolId + place
      const deleteConditions = validRoutes.map(route => ({
        AND: [
          { schoolId: route.schoolId },
          { place: route.place }
        ]
      }));

      await tx.route.deleteMany({
        where: { OR: deleteConditions }
      });

      // Prepare create payload with proper MongoDB format
      const createPayload = validRoutes.map(route => {
        // Convert array coordinates to proper format
        const schoolCoords = Array.isArray(route.schoolCoords) 
          ? { lat: route.schoolCoords[1], lng: route.schoolCoords[0] }
          : route.schoolCoords || { lat: 0, lng: 0 };

        const placeCoords = route.location 
          ? { lat: route.location.lat, lng: route.location.lng }
          : { lat: 0, lng: 0 };

        return {
          schoolId: route.schoolId,
          schoolName: route.schoolName || `School ${route.schoolId.slice(0, 5)}...`,
          travelMode: route.travelMode || 'walking',
          place: route.place,
          amenityType: route.amenityType || 'unknown',
          distance: route.distance,
          duration: route.duration || 0,
          schoolCoords,
          placeCoords,
          location: route.location || { lat: 0, lng: 0 },
          overviewPolyline: route.overviewPolyline || '',
          createdAt: new Date()
        };
      });

      // For MongoDB, we need to create records one by one since createMany doesn't support skipDuplicates
      const createdRoutes = [];
      for (const route of createPayload) {
        try {
          const created = await tx.route.create({
            data: route
          });
          createdRoutes.push(created);
        } catch (error) {
          if (!error.message.includes('Unique constraint')) {
            throw error;
          }
          // Skip duplicate errors
          console.warn('Duplicate route skipped:', route);
        }
      }

      return {
        count: createdRoutes.length,
        routes: createdRoutes
      };
    });

    return transaction;
  } catch (error) {
    console.error('Database operation failed:', {
      message: error.message,
      status: error.status,
      details: error.details
    });

    throw {
      status: error.status || 500,
      message: error.message || 'Database operation failed',
      details: error.details || {
        action: 'bulk_save',
        recordsReceived: routes.length
      },
      failures: routes
    };
  } finally {
    if (!transaction) {
      await prisma.$disconnect();
    }
  }
};

module.exports = { saveBulkRoutes };