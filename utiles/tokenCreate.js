const jwt = require("jsonwebtoken");
module.exports.createToken = async (data) => {
  const token = await jwt.sign(data, "ThuYainSoe", {
    expiresIn: "7d",
  });
  return token;
};
