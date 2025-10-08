const categoryControllers = require("../../controllers/dashboard/categoryControllers");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

const router = require("express").Router();

router.post(
  "/category-add",
  authMiddleware,
  upload.single("image"),
  categoryControllers.add_category
);
router.get("/category-get", authMiddleware, categoryControllers.get_category);
router.put(
  "/category-update/:id",
  authMiddleware,
  upload.single("image"),
  categoryControllers.update_category
);
router.delete(
  "/category-delete/:id",
  authMiddleware,
  categoryControllers.deleteCategory
);

module.exports = router;
