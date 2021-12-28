const { response } = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const { generateJWT } = require("../helpers/jwt");

const createUser = async (req, res = response) => {
  try {
    const { email, password } = req.body;
    const existEmail = await User.findOne({ email });

    if (existEmail) {
      return res.status(400).json({
        ok: false,
        msg: "Email already exists",
      });
    }

    const user = new User(req.body);

    // Crypt password
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(password, salt);

    // Save in DB
    await user.save();

    // JWT
    const token = await generateJWT(user.id);

    res.json({ ok: true, user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Speak with administrator",
    });
  }
};

const login = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    const userDB = await User.findOne({ email });

    if (!userDB) {
      return res.status(404).json({
        ok: false,
        msg: "Email not found",
      });
    }

    const validPassword = bcrypt.compareSync(password, userDB.password);

    if (!validPassword) {
      return res.status(404).json({
        ok: false,
        msg: "Password not found",
      });
    }

    const token = await generateJWT(userDB.id);

    res.json({ ok: true, userDB, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Speak with administrator",
    });
  }
};

const renewToken = async (req, res = response) => {
  const uid = req.uid;

  // Generate new token
  const token = await generateJWT(uid);

  const user = await User.findById(uid);

  res.json({
    ok: true,
    user,
    token,
  });
};

module.exports = {
  createUser,
  login,
  renewToken,
};
