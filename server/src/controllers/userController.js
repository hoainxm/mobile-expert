/** @format */

const asyncHandle = require('express-async-handler');
const UserModel = require('../models/userModel');
const EventModel = require('../models/eventModel');
const {JWT} = require('google-auth-library');
const cloudinary = require('../configs/cloudinaryConfig');
const multer = require('multer');
const bcryp = require('bcrypt');

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
});

const handleSendMail = async val => {
  try {
    await transporter.sendMail(val);

    return 'OK';
  } catch (error) {
    return error;
  }
};

const getAllUsers = asyncHandle(async (req, res) => {
  const users = await UserModel.find({});

  const data = [];
  users.forEach(item =>
    data.push({
      email: item.email ?? '',
      name: item.name ?? '',
      id: item.id,
    }),
  );

  res.status(200).json({
    message: 'Get users successfully!!!',
    data,
  });
});

const getEventsFollowed = asyncHandle(async (req, res) => {
  const {uid} = req.query;

  if (uid) {
    const events = await EventModel.find({followers: {$all: uid}});

    const ids = [];

    events.forEach(event => ids.push(event.id));

    res.status(200).json({
      message: 'fafa',
      data: ids,
    });
  } else {
    res.sendStatus(401);
    throw new Error('Missing uid');
  }
});
const getProfile = asyncHandle(async (req, res) => {
  const uid = req.user.id;

  if (uid) {
    const profile = await UserModel.findOne({_id: uid});

    res.status(200).json({
      message: 'Lấy thông tin người dùng thành công',
      data: profile,
    });
  } else {
    res.sendStatus(401);
    throw new Error('Missing uid');
  }
});

const updateFcmToken = asyncHandle(async (req, res) => {
  const {user, fcmTokens} = req.body;
  if (!user || !fcmTokens) {
    return res.status(400).json({message: 'Missing user or fcmTokens'});
  }
  await UserModel.findByIdAndUpdate(user, {
    fcmTokens,
  });

  res.status(200).json({
    message: 'Fcmtoken updated',
    data: [],
  });
});

const getAccessToken = () => {
  return new Promise(function (resolve, reject) {
    const key = require('../evenhub-accesstoken-file.json');
    const jwtClient = new JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/cloud-platform'],
      null,
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
};

const handleSendNotification = async ({token, title, subtitle, body, data}) => {
  var request = require('request');
  var options = {
    method: 'POST',
    url: 'https://fcm.googleapis.com/v1/projects/evenhub-f8c6e/messages:send',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify({
      message: {
        token,
        notification: {
          title,
          body,
          subtitle,
        },
        data,
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(error);

    console.log(response);
  });
};

const getFollowes = asyncHandle(async (req, res) => {
  const {uid} = req.query;

  if (uid) {
    const users = await UserModel.find({following: {$all: uid}});

    const ids = [];

    if (users.length > 0) {
      users.forEach(user => ids.push(user._id));
    }

    res.status(200).json({
      message: '',
      data: ids,
    });
  } else {
    res.sendStatus(404);
    throw new Error('can not find uid');
  }
});
const getFollowings = asyncHandle(async (req, res) => {
  const {uid} = req.query;

  if (uid) {
    const user = await UserModel.findById(uid);

    res.status(200).json({
      message: '',
      data: user.following,
    });
  } else {
    res.sendStatus(404);
    throw new Error('can not find uid');
  }
});

const updateProfile = asyncHandle(async (req, res) => {
  const body = req.body;
  const uid = req.user.id;
  console.log(body);

  const salt = await bcryp.genSalt(10);
  const bcryptPass = await bcryp.hash(body.password, salt);
  if (uid && body) {
    const data = await UserModel.findByIdAndUpdate(uid, {
      name: body.name,
      password: bcryptPass,
      email: body.email,
      phone: body.phone,
      address: body.address,
      photoUrl: body.photoUrl,
    });

    res.status(200).json({
      message: 'Update profile successfully',
      data: data,
    });
  } else {
    res.sendStatus(401);
    throw new Error('Missing uid');
  }
});
const updatePhotoUrl = async (req, res) => {
  try {
    const {userId, photoUrl} = req.body;

    if (!userId || !photoUrl) {
      return res.status(400).json({message: 'Thiếu userId hoặc photoUrl'});
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {photoUrl},
      {new: true},
    );

    if (!updatedUser) {
      return res.status(404).json({message: 'Không tìm thấy người dùng'});
    }

    res.status(200).json({
      message: 'Cập nhật ảnh thành công!',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Lỗi cập nhật photoUrl:', error);
    res.status(500).json({message: 'Lỗi server khi cập nhật ảnh'});
  }
};

const storage = multer.diskStorage({});
const upload = multer({storage});
const updateInterests = asyncHandle(async (req, res) => {
  const body = req.body;
  const {uid} = req.query;

  if (uid && body) {
    await UserModel.findByIdAndUpdate(uid, {
      interests: body,
    });

    res.status(200).json({
      message: 'Update interested successfully',
      data: body,
    });
  } else {
    res.sendStatus(404);
    throw new Error('Missing data');
  }
});

const toggleFollowing = asyncHandle(async (req, res) => {
  const {uid, authorId} = req.body;

  if (uid && authorId) {
    const user = await UserModel.findById(uid);

    if (user) {
      const {following} = user;

      const items = following ?? [];
      const index = items.findIndex(element => element === authorId);
      if (index !== -1) {
        items.splice(index, 1);
      } else {
        items.push(`${authorId}`);
      }

      await UserModel.findByIdAndUpdate(uid, {
        following: items,
      });

      res.status(200).json({
        message: 'update following successfully!!!',
        data: items,
      });
    } else {
      res.sendStatus(404);
      throw new Error('user or author not found!!!');
    }
  } else {
    res.sendStatus(404);
    throw new Error('Missing data!!');
  }
});

const pushInviteNotifications = asyncHandle(async (req, res) => {
  const {ids, eventId} = req.body;

  ids.forEach(async id => {
    const user = await UserModel.findById(id);

    const fcmTokens = user.fcmTokens;

    if (fcmTokens > 0) {
      fcmTokens.forEach(
        async token =>
          await handleSendNotification({
            fcmTokens: token,
            title: 'fasfasf',
            subtitle: '',
            body: 'Bạn đã được mời tham gia vào sự kiện nào đó',
            data: {
              eventId,
            },
          }),
      );
    } else {
      // Send mail
      const data = {
        from: `"Support EventHub Appplication" <${process.env.USERNAME_EMAIL}>`,
        to: email,
        subject: 'Verification email code',
        text: 'Your code to verification email',
        html: `<h1>${eventId}</h1>`,
      };

      await handleSendMail(data);
    }
  });

  res.status(200).json({
    message: 'fafaf',
    data: [],
  });
});

const pushTestNoti = asyncHandle(async (req, res) => {
  const {title, body, data} = req.body;

  console.log(title);

  // await handleSendNotification({
  // 	data,
  // 	title,
  // 	body,
  // });

  res.status(200).json({
    message: 'fafa',
    data: [],
  });
});
module.exports = {
  getAllUsers,
  getEventsFollowed,
  updateFcmToken,
  getProfile,
  updatePhotoUrl,
  getFollowes,
  updateProfile,
  updateInterests,
  toggleFollowing,
  getFollowings,
  pushInviteNotifications,
  pushTestNoti,
  uploadMiddleware: upload.single('image'),
};
