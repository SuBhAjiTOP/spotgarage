const { sendOtp, verifyOtp } = require("../util/otp");

//* Helper functions
const registerTheUser = async (username, phone, email, collection) => {
  let user = await collection.findOne({ phone });

  if (!user) {
    let newUser = await collection.insertOne({
      username,
      phone,
      email,
      createdAt: new Date(),
    });
    return { status: true, newUser };
  } else return { status: false, msg: "User already exist!!", user };
};

//* Mobile Number Validation functions
function transform(mobile) {
  const pattern = /^\+91\d{10}$/;

  if (!pattern.test(mobile)) {
    if (!mobile.startsWith("+91")) {
      mobile = "+91" + mobile;
      return mobile;
    }
  }

  if (!pattern.test(mobile)) {
    throw new Error(
      "Issue at the register user number pipeline and the received phone-no is " +
        mobile
    );
  }

  return mobile;
}

//* Main functions
exports.userRegister = async (req, res, next) => {
  try {
    let { userMobile, userName, userEmail } = req.body;
    userMobile = transform(userMobile);
    const db = global.db.db("spotgarage");
    const collection = db.collection("vendors");

    const data = await registerTheUser(
      userName,
      userMobile,
      userEmail,
      collection
    );

    !data.status
      ? res.status(400).json({ status: false, message: data.msg })
      : res.status(200).send(data.newUser);
  } catch (err) {
    console.log(err);
  }
};

exports.userOtpSend = async (req, res) => {
  try {
    let { userMobile } = req.body;
    userMobile = await transform(userMobile);
    (await sendOtp(userMobile))
      ? res
          .status(200)
          .json({ status: true, message: "Otp Send Successfully!!" })
      : res.status(400).json({ status: false, message: "Otp Not Send!!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.userOtpVerify = async (req, res, next) => {
  try {
    let { userMobile, userOtp } = req.body;
    userMobile = await transform(userMobile);
    const db = global.db.db("spotgarage");
    const collection = db.collection("vendors");
    let user = await collection.findOne({ phone: userMobile });
    if (await verifyOtp(userMobile, userOtp))
      user
        ? res.status(200).json({
            status: true,
            loginStatus: true,
            message: "Go for Login!!",
          })
        : res.status(200).json({
            status: true,
            loginStatus: false,
            message: "Go for Registration!!",
          });
    else
      res
        .status(400)
        .json({ status: false, message: "Otp Verification Failed!!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// exports.userLogin = async (req, res, next) => {
//   try {
//     const { userMobile } = req.body;

//     // mongoClient = await connectWithDb();
//     const db = global.db.db("spotgrage");
//     const collection = db.collection("users");

//     let confirmUser = await collection.findOne({ phone: userMobile });

//     if (!confirmUser)
//       return res
//         .status(400)
//         .json({ status: false, msg: "Please go for the registration!!" });

//     await this.userOtpSend(req, res);
//   } catch (err) {
//     console.log(err);
//   }
// };
