import { createCookie, createFileSessionStorage } from "@remix-run/node";

const sessionCookie = createCookie("__session", {
  sameSite: true,
});

const { getSession, commitSession, destroySession } = createFileSessionStorage({
  dir: process.env.HOME + "/langchain-exp/app/sessions",
  cookie: sessionCookie,
});

export { getSession, commitSession, destroySession };
