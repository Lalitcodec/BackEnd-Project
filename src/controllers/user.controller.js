import {asyncHandler} from '../utils/asyncHandler.js';
 
const registerUser = asyncHandler(async (req,res) => {
    res.status(500).json({
        message : "JAADU"
    })
})


export {registerUser}