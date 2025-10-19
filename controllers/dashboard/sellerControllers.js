const { responseReturn } = require("../../utiles/response");
const sellerModel = require("../../models/sellerModel");

class sellerController {
  // Get all sellers with pagination and search
  get_sellers = async (req, res) => {
    const { page = 1, searchValue = "", perPage: perPageUI = 10 } = req.query;

    try {
      const currentPage = parseInt(page);
      const perPage = parseInt(perPageUI);
      const skipPage = perPage * (currentPage - 1);

      // Build search query
      const searchQuery = searchValue
        ? {
            $or: [
              { name: { $regex: searchValue, $options: "i" } },
              { email: { $regex: searchValue, $options: "i" } },
              { "shopInfo.shopName": { $regex: searchValue, $options: "i" } },
            ],
          }
        : {};

      // Get sellers with pagination
      const sellers = await sellerModel
        .find(searchQuery)
        .skip(skipPage)
        .limit(perPage)
        .sort({ createdAt: -1 });

      // Get total count
      const totalSellers = await sellerModel.find(searchQuery).countDocuments();

      // Calculate total pages
      const totalPages = Math.ceil(totalSellers / perPage);

      responseReturn(res, 200, {
        sellers,
        pagination: {
          total: totalSellers,
          per_page: perPage,
          current_page: currentPage,
          total_pages: totalPages,
          from: skipPage + 1,
          to: Math.min(skipPage + perPage, totalSellers),
        },
      });
    } catch (error) {
      console.error("Get sellers error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Get sellers by status (pending, active, deactive)
  get_sellers_by_status = async (req, res) => {
    const {
      page = 1,
      searchValue = "",
      perPage: perPageUI = 10,
      status,
    } = req.query;

    try {
      const currentPage = parseInt(page);
      const perPage = parseInt(perPageUI);
      const skipPage = perPage * (currentPage - 1);

      // Build search query with status filter
      const searchQuery = {
        status: status || "pending",
        ...(searchValue && {
          $or: [
            { name: { $regex: searchValue, $options: "i" } },
            { email: { $regex: searchValue, $options: "i" } },
            { "shopInfo.shopName": { $regex: searchValue, $options: "i" } },
          ],
        }),
      };

      // Get sellers with pagination
      const sellers = await sellerModel
        .find(searchQuery)
        .skip(skipPage)
        .limit(perPage)
        .sort({ createdAt: -1 });

      // Get total count
      const totalSellers = await sellerModel.find(searchQuery).countDocuments();

      // Calculate total pages
      const totalPages = Math.ceil(totalSellers / perPage);

      responseReturn(res, 200, {
        sellers,
        pagination: {
          total: totalSellers,
          per_page: perPage,
          current_page: currentPage,
          total_pages: totalPages,
          from: skipPage + 1,
          to: Math.min(skipPage + perPage, totalSellers),
        },
      });
    } catch (error) {
      console.error("Get sellers by status error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Get single seller by ID
  get_seller = async (req, res) => {
    try {
      const { id } = req.params;

      const seller = await sellerModel.findById(id);

      if (!seller) {
        return responseReturn(res, 404, { error: "Seller not found" });
      }

      responseReturn(res, 200, { seller });
    } catch (error) {
      console.error("Get seller error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Update seller status
  update_seller_status = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ["pending", "active", "deactive"];
      if (!validStatuses.includes(status)) {
        return responseReturn(res, 400, {
          error: "Invalid status. Must be pending, active, or deactive",
        });
      }

      const seller = await sellerModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!seller) {
        return responseReturn(res, 404, { error: "Seller not found" });
      }

      responseReturn(res, 200, {
        seller,
        message: `Seller status updated to ${status} successfully`,
      });
    } catch (error) {
      console.error("Update seller status error:", error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
}

module.exports = new sellerController();
