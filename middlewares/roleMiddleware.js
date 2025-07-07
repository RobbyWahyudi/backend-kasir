exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Akses ditolak: role tidak diizinkan" });
    }

    next(); // lanjut ke controller
  };
};
