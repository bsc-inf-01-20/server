const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Set transaction timeout to 30 seconds (max allowed by MongoDB)
const TRANSACTION_TIMEOUT = 30000;

const saveBulkRoutes = async (routes) => {
  const chunkSize = 5; // Process 5 routes at a time
  const chunks = [];

  // Split routes into chunks
  for (let i = 0; i < routes.length; i += chunkSize) {
    chunks.push(routes.slice(i, i + chunkSize));
  }

  const results = {
    savedCount: 0,
    routes: [],
    errors: [],
  };

  // Process each chunk in its own transaction
  for (const [index, chunk] of chunks.entries()) {
    let transaction;
    try {
      transaction = await prisma.$transaction(
        async (tx) => {
          const chunkResults = [];

          for (const route of chunk) {
            // Validate required fields
            if (
              !route.schoolId ||
              !route.amenityType ||
              typeof route.distance !== "number"
            ) {
              results.errors.push({
                route,
                error: "Missing required fields",
              });
              continue;
            }

            try {
              // Prepare route data
              const data = {
                schoolId: route.schoolId,
                schoolName:
                  route.schoolName || `School ${route.schoolId.slice(0, 5)}...`,
                travelMode: route.travelMode || "walking",
                place: route.place || "Unknown Place",
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
                overviewPolyline: route.overviewPolyline || "",
                division: route.division || "Unknown",
                district: route.district || "Unknown",
                zone: route.zone || "Unknown",
                updatedAt: new Date(),
              };

              // Find existing route
              const existingRoute = await tx.route.findFirst({
                where: {
                  AND: [
                    { schoolId: route.schoolId },
                    { amenityType: route.amenityType },
                    { travelMode: route.travelMode || "walking" },
                  ],
                },
              });

              let savedRoute;
              if (existingRoute) {
                // Update existing
                console.log("Saving route data:", data);
                savedRoute = await tx.route.update({
                  where: { id: existingRoute.id },
                  data: data,
                });
              } else {
                // Create new
                console.log("Saving route data:", data);
                savedRoute = await tx.route.create({
                  data: {
                    ...data,
                    createdAt: new Date(),
                  },
                });
              }

              chunkResults.push(savedRoute);
            } catch (error) {
              results.errors.push({
                route,
                error: error.message,
              });
            }
          }

          return chunkResults;
        },
        {
          timeout: TRANSACTION_TIMEOUT,
          maxWait: TRANSACTION_TIMEOUT,
        }
      );

      results.savedCount += transaction.length;
      results.routes.push(...transaction);
    } catch (error) {
      results.errors.push({
        error: error.message,
        chunkIndex: index,
      });
    } finally {
      if (transaction) {
        await prisma.$disconnect();
      }
    }
  }

  return {
    success: results.errors.length === 0,
    savedCount: results.savedCount,
    routes: results.routes,
    errors: results.errors,
    totalProcessed: routes.length,
  };
};

module.exports = { saveBulkRoutes };
