export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
};
