// asyncHandler is a higher-order function.
// It takes an async route handler and returns a new function
// that Express can safely call.
const asyncHandler = (reqHandler) => {

      // This returned function is what Express will actually run
      return (req, res, next) => {

            // We wrap the route handler in Promise.resolve()
            // so it works for both async and non-async functions
            Promise.resolve(
                  reqHandler(req, res, next)   // call the real route handler
            )
            // If the promise rejects (error thrown),
            // forward it to Express's error middleware
            .catch((err) => next(err))
      }
}

export { asyncHandler }





// Another method for doing the same thing


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}

// const asyncHandler = (fn) => async (req,res,next) => {
//       try {
//             await fn(req,res,next)
//       } catch (error) {
//             res.status(err.code || 500).json({
//                   success: false,
//                   message: err.message
//             })

//       }
// }