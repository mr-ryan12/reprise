import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("shows", "routes/shows.tsx"),
  route("shows/:showDate", "routes/shows.$showDate.tsx"),
  route("favorites", "routes/favorites.tsx"),
  route("api/logout", "routes/api.logout.tsx"),
] satisfies RouteConfig;
