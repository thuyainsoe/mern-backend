const { responseReturn } = require("../../utiles/response");
const cloudinary = require("cloudinary").v2;
const categoryModel = require("../../models/categoryModel");

class categoryController {
  add_category = async (req, res) => {
    try {
      let { name } = req.body;
      const image = req.file;

      name = name.trim();
      const slug = name.split(" ").join("-");

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      try {
        let imageUrl = "";

        if (image) {
          // Upload from buffer (memory) to Cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: "categorys" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
              })
              .end(image.buffer);
          });

          imageUrl = result.url;
        }

        const category = await categoryModel.create({
          name,
          slug,
          image: imageUrl || "",
        });

        responseReturn(res, 201, {
          category,
          message: "Category Added Successfully",
        });
      } catch (error) {
        console.error("Upload error:", error);
        responseReturn(res, 500, { error: "Internal Server Error" });
      }
    } catch (err) {
      console.log(err, "err");
      responseReturn(res, 404, { error: "something went wrong" });
    }
  };

  // end method

  get_category = async (req, res) => {
    const { page = 1, searchValue = "", perPage: perPageUI = 10 } = req.query;

    try {
      const currentPage = parseInt(page);
      const perPage = parseInt(perPageUI);
      const skipPage = perPage * (currentPage - 1);

      // Build search query
      const searchQuery = searchValue
        ? { name: { $regex: searchValue, $options: "i" } }
        : {};

      // Get categories with pagination
      const categorys = await categoryModel
        .find(searchQuery)
        .skip(skipPage)
        .limit(perPage)
        .sort({ createdAt: -1 });

      // Get total count
      const totalCategory = await categoryModel
        .find(searchQuery)
        .countDocuments();

      // Calculate total pages
      const totalPages = Math.ceil(totalCategory / perPage);

      responseReturn(res, 200, {
        categorys,
        pagination: {
          total: totalCategory,
          per_page: perPage,
          current_page: currentPage,
          total_pages: totalPages,
          from: skipPage + 1,
          to: Math.min(skipPage + perPage, totalCategory),
        },
      });
    } catch (error) {
      console.error("Get categories error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // end method

  update_category = async (req, res) => {
    try {
      let { name } = req.body;
      const image = req.file;
      const { id } = req.params;

      name = name.trim();
      const slug = name.split(" ").join("-");

      try {
        const updateData = {
          name,
          slug,
        };

        if (image) {
          cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true,
          });

          // Upload from buffer (memory) to Cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: "categorys" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
              })
              .end(image.buffer);
          });

          updateData.image = result.url;
        }

        const category = await categoryModel.findByIdAndUpdate(id, updateData, {
          new: true,
        });
        responseReturn(res, 200, {
          category,
          message: "Category Updated successfully",
        });
      } catch (error) {
        console.error("Update error:", error);
        responseReturn(res, 500, { error: "Internal Server Error" });
      }
    } catch (err) {
      responseReturn(res, 404, { error: "something went wrong" });
    }
  };

  // end method

  deleteCategory = async (req, res) => {
    try {
      const categoryId = req.params.id;
      const deleteCategory = await categoryModel.findByIdAndDelete(categoryId);

      if (!deleteCategory) {
        console.log(`Cateogry with id ${categoryId} not found`);
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      console.log(`Error delete category with id ${categoryId}:`, error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  // end method
}

module.exports = new categoryController();
