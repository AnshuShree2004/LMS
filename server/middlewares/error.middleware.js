
const errorMiddleware = (error, req, res, next) => {

  req.statusCode = req.statusCode || 500
  req.message = req.message || 'Something went wrong'

    res.statu().json({
        success: false,
        message: req.message ,
        stack: error.stack
    })
}

export default errorMiddleware