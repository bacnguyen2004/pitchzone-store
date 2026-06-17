import { adminNavGroups } from "./adminNav";

const pageMetaByPath = {};

adminNavGroups.forEach((group) => {
  group.items.forEach((item) => {
    pageMetaByPath[item.to] = {
      title: item.label,
      group: group.label,
      breadcrumb: [group.label, item.label],
    };
  });
});

export function getAdminPageMeta(pathname) {
  if (pageMetaByPath[pathname]) {
    return pageMetaByPath[pathname];
  }

  const match = Object.entries(pageMetaByPath).find(
    ([path]) => path !== "/admin" && pathname.startsWith(path),
  );

  if (match) {
    return match[1];
  }

  return {
    title: "Quản trị",
    group: "Admin",
    breadcrumb: ["Quản trị"],
  };
}