const { responseReturn } = require("../../utiles/response");
const cloudinary = require("cloudinary").v2;
const sellerModel = require("../../models/sellerModel");
const bcrypt = require("bcrypt");

class profileController {
  // Get seller profile
  get_profile = async (req, res) => {
    const { id } = req;

    try {
      const seller = await sellerModel.findById(id);

      if (!seller) {
        return responseReturn(res, 404, { error: "Seller not found" });
      }

      responseReturn(res, 200, { userInfo: seller });
    } catch (error) {
      console.error("Get profile error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Update profile image
  profile_image_upload = async (req, res) => {
    const { id } = req;
    const image = req.file;

    try {
      if (!image) {
        return responseReturn(res, 400, { error: "No image provided" });
      }

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      // Upload image to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "profiles" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(image.buffer);
      });

      // Update seller profile with new image
      const seller = await sellerModel.findByIdAndUpdate(
        id,
        { image: result.url },
        { new: true }
      );

      responseReturn(res, 200, {
        userInfo: seller,
        message: "Profile image updated successfully",
      });
    } catch (error) {
      console.error("Profile image upload error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Update shop info
  update_shop_info = async (req, res) => {
    const { id } = req;
    const { shopName, division, district, sub_district } = req.body;

    try {
      const seller = await sellerModel.findByIdAndUpdate(
        id,
        {
          shopInfo: {
            shopName,
            division,
            district,
            sub_district,
          },
        },
        { new: true }
      );

      responseReturn(res, 200, {
        userInfo: seller,
        message: "Shop information updated successfully",
      });
    } catch (error) {
      console.error("Update shop info error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Change password
  change_password = async (req, res) => {
    const { id } = req;
    const { email, old_password, new_password } = req.body;

    try {
      // Get seller with password field
      const seller = await sellerModel.findById(id).select("+password");

      if (!seller) {
        return responseReturn(res, 404, { error: "Seller not found" });
      }

      // Verify email matches
      if (seller.email !== email) {
        return responseReturn(res, 400, { error: "Email does not match" });
      }

      // Verify old password
      const isMatch = await bcrypt.compare(old_password, seller.password);
      if (!isMatch) {
        return responseReturn(res, 400, { error: "Old password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update password
      await sellerModel.findByIdAndUpdate(id, {
        password: hashedPassword,
      });

      responseReturn(res, 200, {
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
}

module.exports = new profileController();
