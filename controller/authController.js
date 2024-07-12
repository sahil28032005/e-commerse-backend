const Schema = require('mongoose');
const userSchema = require('../models/userSchema');
const { hashPass, compareHash } = require('../helpers/authHashing'); // Adjust the path accordingly
const JWT = require('jsonwebtoken');
//google auth imports

const passport = require('../helpers/passportSetup');


// Now you can use hashPass and compareHash functions here
hashPass('password').then(hashedPassword => {
    // console.log(hashedPassword);
}).catch(error => {
    console.error(error);
});

compareHash('password', 'hashedValue').then(result => {
    // console.log(result); // Will be true or false depending on the comparison
}).catch(error => {
    console.error(error);
});
//for forgot password functionality
const forgotPasswordController = async (req, res) => {
    try {
        const { email, password, newPass, petName } = req.body;
        if (!email) {
            return res.status(400).send({ error: 'email was not provided' });
        } else if (!password) {
            return res.status(400).send({ error: 'old pass was not provided' });
        } else if (!newPass) {
            return res.status(400).send({ error: 'newpass was not provided' });
        } else if (!petName) {
            return res.status(400).send({ error: 'security ans was not provided' });
        }

        // If all conditions are false, send a success response here we come means previous all done properly
        const user = await userSchema.findOne({ email, petName });
        if (user) {
            //here adding code for actual updatation
            if (compareHash(user.password, password)) {
                // console.log("old password matched");
            }
            else {
                res.status(200).send({
                    success: 'false',
                    message: 'old password not matched'
                });
            }
            const newPassReset = await hashPass(newPass);
            user.password = newPassReset;
            await user.save();
            res.status(200).send({
                success: 'true',
                message: 'password reset successfully'
            });
        }
        else {
            res.status(200).send({
                success: 'false',
                message: 'entered wrong credentials for reseting password'
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'post error' });
    }
};


//for registration
const controlEnteries = async (req, res) => {
    try {
        const { name, email, password, contact, address, petName, role } = req.body; // Access POST request body data
        if (!name) {
            return res.send({ error: 'name was not provided' });
        }
        if (!email) {
            return res.send({ error: 'email was not provided' });
        }
        if (!password) {
            return res.send({ error: 'password inf was not provided' });
        }
        if (!contact) {
            return res.send({ error: 'contact was not provided' });
        }
        if (!address) {
            return res.send({ error: 'address was not provided' });
        }
        if (!petName && petName !== '') {
            return res.send({ error: 'pets name was not provided' });
        }

        // if (!role) {
        //     return res.send({ error: 'role was not provided' });
        // }

        //validate if existing user is present or not
        const existingUser = await userSchema.findOne({ email });
        if (existingUser) {
            res.status(200).send({
                success: 'true',
                message: 'usr already exists returned with wrong status code'
            });
        }
        //hash passwor come from post request while registration request
        const hashedValPass = await hashPass(password);
        //herer flow indicates user is not already prresent and we have to register im
        const regosteredUser = await new userSchema({ name, email, password: hashedValPass, contact, address, petName, role }).save();
        res.status(201).send({
            success: 'true',
            message: 'user registered succesfuly',
            regosteredUser
        });

    }
    catch (error) {
        console.log(error);
        res.status(4000).send({ message: 'something went wrong...', successful: false, error });

    }

};
const loginController = async (req, res) => {

    try {
        const { email, password } = req.body;
        //validate resource parameter come from post url params
        if (!email || !password) {
            return res.status(400).send({ message: 'provide correct params', successful: false });
        }
        const loginRecord = await userSchema.findOne({ email });
        if (!loginRecord) {
            return res.send(500).send({ message: 'record not found!', success: 'false' });
        }
        //at thus line we have to login user by validating passwords
        const validate = await compareHash(password, loginRecord.password);
        if (!validate) {
            return res.status(500).send({ success: 'false', message: 'error while checking password' });
        }
        //here next line will executing means user logined atmost succsfully
        const token = await JWT.sign({ "id": loginRecord._id }, process.env.jwt_secret_key, { expiresIn: '5d' });
        loginRecord.token = token;
        await loginRecord.save();
        // console.log("user logined successfully");
        res.status(200).send({ success: 'true', message: 'user logined successfully', token, loginRecord: loginRecord });
        //navigating to home page
        // navigate("/");

    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'error while logging user as params', success: 'false' });
    }


}
const proctedAccess = async (req, res) => {
    // console.log("inside procted route access...");
}
//controller for uodating user details
const updateUserProfile = async (req, res) => {
    try {
        const { userIdentifier } = req.params;
        // console.log("user identifier for profile update", userIdentifier);
        let { name, email, contact, password } = req.body;
        if (password) {
            //write hashing functionality here to hash password arrived as an plain value from put frintend requeest
            password = await hashPass(password);
        }
        const updatedUser = await userSchema.findByIdAndUpdate(
            userIdentifier,
            { name, email, contact, password },
            { new: true, runValidators: true }
        );
        if (updatedUser) {
            res.status(201).send({
                success: true,
                message: 'user data updated successfully',
                results: updatedUser
            });
        }
        else {
            return res.status(404).send({ message: 'User not found' });
        }
    }
    catch (exception) {
        return res.status(401).send({
            success: false,
            message: 'problem for updating user profile',
            error: exception.message
        });
    }
}
//controllers required foe goofle authentications an sign in
const checkPresentOrNot = async (req, res) => {
    try {
        const { email } = req.body;
        const entry = await userSchema.findOne({ email: email });
        if (entry) {
            res.status(200).json({ exists: true, entry });
        } else {
            res.status(200).json({ exists: false });
        }
    }
    catch (err) {
        res.status(401).send({
            succsee: false,
            message: 'error for checking user existance from api'
        });
    }

}
//creating controller for newly signed in user to store its data
const createNewUserAfterGoogleAuth = async (req, res) => {
    try {
        const { email, name, photo } = req.body;
        const newEntry = new userSchema({ name: name, photo: photo, email: email });
        await newEntry.save();
        res.status(200).send({
            succsee: true,
            message: 'User created successfully after google sign in',
            data: newEntry
        });
    }
    catch (err) {
        res.status(401).send({
            succsee: false,
            message: 'problem for creating user from api'
        });
    }
}
//controlle to make current authenticated users active session as google sign in user
const getUserSession = async (req, res) => {
    try {
        const { email } = req.body;
        const loginRecord = await userSchema.findOne({ email });
        //creating jwt token for that user
        const token = await JWT.sign({ "id": loginRecord._id }, process.env.jwt_secret_key, { expiresIn: '5d' });
        loginRecord.token = token;
        await loginRecord.save();
        res.status(200).send({ success: 'true', message: 'user logined successfully', token, loginRecord: loginRecord });

    }
    catch (err) {
        res.status(401).send({
            succsee: false,
            message: 'problem for fetch newly createrd user session from api'
        });
    }
}
module.exports = { getUserSession, createNewUserAfterGoogleAuth, checkPresentOrNot, updateUserProfile, controlEnteries, loginController, proctedAccess, forgotPasswordController };