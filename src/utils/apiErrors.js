// This class represents errors that come from your API
// It extends the built-in JavaScript Error so it keeps normal error behavior
// (like message and stack trace), but adds API-specific fields.
class apiError extends Error {

      // The constructor runs when you do:
      // new apiError(404, "User not found", [])
      constructor(
            statusCode,                      // HTTP status code (400, 401, 404, 500, etc)
            message = "Something went wrong",// Error message sent to client
            errors = [],                     // Extra error details (validation errors, etc)
            stack = ""                       // Optional stack trace from another error
      ){
            // Call the parent Error constructor
            // This sets this.message and prepares this.stack internally
            super(message)

            // Store the HTTP status code so the error handler knows what to send
            this.statusCode = statusCode

            // APIs often send a "data" field in every response.
            // For errors, there is no data, so it is always null.
            this.data = null

            // Redundant but explicit:
            // Ensures the error message is attached to this object
            this.message = message

            // Used by frontend or API clients to quickly detect failure
            this.success = false

            // Array holding detailed error info
            // Example:
            // [{ field: "email", message: "Invalid email" }]
            this.errors = errors

            // If a stack trace was passed in (usually from another error),
            // reuse it so the real source of the crash is preserved
            if (stack) {
                  this.stack = stack
            } 
            // Otherwise, generate a new stack trace for this error
            else {
                  Error.captureStackTrace(this, this.constructor)
            }
      }
}

// Exporting the class so it can be used in routes, controllers, and middleware
export { apiError }