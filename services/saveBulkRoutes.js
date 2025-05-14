const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saveBulkRoutes = async (routes) => {
  let transaction;
  try {
    transaction = await prisma.$transaction(async (tx) => {
      // Validate and transform routes
      const validRoutes = routes
        .map((route, index) => {
          if (!route.schoolId || !route.amenityType || typeof route.distance !== 'number') {
            console.warn(`Invalid route at index ${index}`, route);
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
            requiredFields: ['schoolId', 'amenityType', 'distance'],
            receivedCount: routes.length,
            validCount: 0
          }
        };
      }

      // Process routes with proper upsert
      const processedRoutes = await Promise.all(
        validRoutes.map(async (route) => {
          // First try to find existing route
          const existingRoute = await tx.route.findFirst({
            where: {
              AND: [
                { schoolId: route.schoolId },
                { amenityType: route.amenityType },
                { travelMode: route.travelMode || 'walking' }
              ]
            }
          });

          const data = {
            schoolId: route.schoolId,
            schoolName: route.schoolName || `School ${route.schoolId.slice(0, 5)}...`,
            travelMode: route.travelMode || 'walking',
            place: route.place || 'Unknown Place',
            amenityType: route.amenityType,
            distance: route.distance,
            duration: route.duration || 0,
            schoolCoords: Array.isArray(route.schoolCoords) 
              ? { lat: route.schoolCoords[1], lng: route.schoolCoords[0] }
              : route.schoolCoords || { lat: 0, lng: 0 },
            placeCoords: route.location 
              ? { lat: route.location.lat, lng: route.location.lng }
              : { lat: 0, lng: 0 },
            location: route.location || { lat: 0, lng: 0 },
            overviewPolyline: route.overviewPolyline || '',
            updatedAt: new Date()
          };

          try {
            if (existingRoute) {
              // Update existing route
              return await tx.route.update({
                where: { id: existingRoute.id },
                data: data
              });
            } else {
              // Create new route
              return await tx.route.create({
                data: {
                  ...data,
                  createdAt: new Date()
                }
              });
            }
          } catch (error) {
            console.error('Error saving route:', error.message);
            return null;
          }
        })
      );

      return {
        count: processedRoutes.filter(Boolean).length,
        routes: processedRoutes.filter(Boolean)
      };
    });

    return transaction;
  } catch (error) {
    console.error('Database operation failed:', error);
    throw {
      status: error.status || 500,
      message: error.message || 'Database operation failed',
      details: error.details || {
        action: 'bulk_save',
        recordsReceived: routes.length
      }
    };
  } finally {
    if (!transaction) {
      await prisma.$disconnect();
    }
  }
};

module.exports = { saveBulkRoutes };