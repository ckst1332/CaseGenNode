import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/`;
    },

    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile.sub;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
