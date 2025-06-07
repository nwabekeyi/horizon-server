import Industry from "../../models/industries";

const industryResource = {
  resource: Industry,
  options: {
    properties: {
      _id: { isVisible: { list: true, edit: false, filter: true, show: true } },
      industry: { isVisible: { list: true, edit: true, filter: true, show: true } },
      createdAt: { isVisible: { list: true, edit: false, filter: true, show: true } },
      updatedAt: { isVisible: { list: true, edit: false, filter: true, show: true } },
    },
    actions: {
      new: { isAccessible: true },
      edit: { isAccessible: true },
      delete: { isAccessible: true },
      list: { isAccessible: true },
      show: { isAccessible: true },
    },
  },
};

export default industryResource;