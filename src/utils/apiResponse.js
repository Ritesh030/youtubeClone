// This class is used to create a standard response format for your API
// Instead of sending random objects from every route,
// you wrap your response inside this class for consistency.
class apiResponse {

      // The constructor runs when you create a new apiResponse
      // Example:
      // new apiResponse(200, userData, "User fetched successfully")
      constructor(statusCode, data, message = "Success") {

            // The actual data you want to send to the client
            // This can be anything: user object, array, token, etc.
            this.data = data

            // HTTP status code (200, 201, 400, 500, etc)
            // This tells the client whether the request succeeded or failed
            this.statusCode = statusCode

            // A human-readable message explaining what happened
            // Defaults to "Success" if you don’t pass anything
            this.message = message

            // Boolean flag used by frontend to quickly check if request worked
            // Any status code below 400 means success (2xx and 3xx are not errors)
            // 400 and above are client or server errors
            this.success = statusCode < 400
      }
}

// Exporting the class so it can be used in controllers and services
export { apiResponse }