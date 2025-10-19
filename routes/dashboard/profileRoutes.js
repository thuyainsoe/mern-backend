const profileControllers = require("../../controllers/dashboard/profileControllers");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

const router = require("express").Router();

router.get("/profile-get", authMiddleware, profileControllers.get_profile);

router.post(
  "/profile-image-upload",
  authMiddleware,
  upload.single("image"),
  profileControllers.profile_image_upload
);

router.put(
  "/shop-info-update",
  authMiddleware,
  profileControllers.update_shop_info
);

router.put(
  "/change-password",
  authMiddleware,
  profileControllers.change_password
);

module.exports = router;
