class apiError extends Error{
    constructor (
        statusCode,
        message = "Something went wrong",
        errorr= [],
        stack = ""

    ){ 
        super(message)
        this.statusCode = statusCode
        this.error = error
        this.data = null 
        this.message = message
        this.succes = false
        

    }
}