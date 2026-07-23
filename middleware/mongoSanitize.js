const clean = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else {
        clean(obj[key]);
      }
    }
  }
};

export default (req, _res, next) => {
  clean(req.body);
  clean(req.query);
  clean(req.params);
  next();
};
