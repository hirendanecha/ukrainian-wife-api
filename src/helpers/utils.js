const environment = require("../environments/environment");
const email = require("./email");
const common = require("../common/common");
const jwt = require("jsonwebtoken");
const __upload_dir = environment.UPLOAD_DIR;
var fs = require("fs");
const db = require("../../config/db.config");

exports.send404 = function (res, err) {
  res.status(404).send({ error: true, message: err });
};

exports.send500 = function (res, err) {
  res.status(500).send({ error: true, message: err });
};

exports.isWithinRange = function (text, min, max) {
  // check if text is between min and max length
};

exports.getactualfilename = (fname, folder, id) => {
  var fileName = fname;
  const dir = __upload_dir + "/" + folder + "/" + id;
  console.log(dir);
  let files = fs.readdirSync(dir);
  if (files && files.length > 0) {
    files.forEach((file) => {
      console.log("file >> ", file);
      if (fileName.indexOf(file.split(".")[0]) !== -1) {
        fileName = file;
      }
    });
  }

  return [dir, fileName];
};

exports.registrationMail = async (userData) => {
  try {
    const payload = {
      id: userData.id,
      email: userData.email,
    };
    const token = await common.generateJwtToken(payload);

    let registerUrl = `${environment.API_URL}customers/user/verification/${token}`;

    const mailObj = {
      email: userData.email,
      subject: "Account Activation link",
      root: "../email-templates/registration.ejs",
      templateData: { url: registerUrl, name: userData.userName },
    };

    console.log(mailObj);
    await email.sendMail(mailObj);
    return;
  } catch (error) {
    return error;
  }
};

exports.forgotPasswordMail = async (user) => {
  console.log(user);
  if (user) {
    let name = user?.userName;
    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = await common.generateJwtToken(payload);
    let forgotPasswordUrl = `${environment.FRONTEND_URL}reset-password/user?accesstoken=${token}`;
    const mailObj = {
      email: user?.email,
      subject: "Forgot password",
      root: "../email-templates/forgot-password.ejs",
      templateData: { name: name, url: forgotPasswordUrl },
    };

    const emailData = await email.sendMail(mailObj);
    return emailData;
  } else {
    return { error: "User not found with this email" };
  }
};

exports.notificationMail = async (userData) => {
  let name = userData?.userName;
  let msg =
    userData?.msg ||
    `You were tagged in ${userData.senderUsername}'s ${userData.type}.`;
  let redirectUrl = userData.postId
    ? `${environment.FRONTEND_URL}post/${userData.postId}`
    : `${environment.FRONTEND_URL}`;

  const mailObj = {
    email: userData.email,
    subject: "UG notification",
    root: "../email-templates/notification.ejs",
    templateData: { name: name, msg: msg, url: redirectUrl },
  };

  await email.sendMail(mailObj);
  return;
};

exports.channelNotificationEmail = async (userData) => {
  let name = userData?.userName;
  let msg = `You have been assign in UkrainianWife channel by the UkrainianWife Admin.
  To access your channel, log into your UkrainianWife account,click on the
  UkrainianWife icon at the top of the page,then click on My Channel.`;
  let redirectUrl = `${environment.FRONTEND_URL}`;

  const mailObj = {
    email: userData.email,
    subject: "Dating notification",
    root: "../email-templates/notification.ejs",
    templateData: { name: name, msg: msg, url: redirectUrl },
  };

  await email.sendMail(mailObj);
  return;
};

exports.communityApproveEmail = async (profileId, isApprove) => {
  const query =
    "select u.email,p.userName from users as u left join profile as p on p.userId = u.id where p.id =?";
  const values = [profileId];
  const userData = await this.executeQuery(query, values);
  if (userData) {
    let name = userData[0]?.userName;
    let msg = "";
    if (isApprove === "Y") {
      msg = `UkrainianWife has approved your Connection application.`;
    } else {
      msg = `UkrainianWife has unapproved your Connection application.`;
    }
    let redirectUrl = `${environment.FRONTEND_URL}`;
    const mailObj = {
      email: userData[0].email,
      subject: "Dating notification",
      root: "../email-templates/notification.ejs",
      templateData: { name: name, msg: msg, url: redirectUrl },
    };
    await email.sendMail(mailObj);
    return;
  }
};

exports.notificationMailOnInvite = async (userData) => {
  let name = userData?.userName;
  let msg = userData.msg;
  let redirectUrl = `${environment.FRONTEND_URL}chats`;

  const mailObj = {
    email: userData.email,
    subject: "UG notification",
    root: "../email-templates/notification.ejs",
    templateData: { name: name, msg: msg, url: redirectUrl },
  };
  console.log(mailObj);

  await email.sendMail(mailObj);
  return;
};

exports.executeQuery = async (query, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, values, function (err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};
