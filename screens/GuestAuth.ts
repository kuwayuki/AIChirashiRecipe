import { getCurrentUser, signIn, signOut, signUp } from "@aws-amplify/auth";
import { v4 as uuidv4 } from "uuid";
import { getLocalStorage, saveLocalStorage } from "./utils";

const GUEST_PASSWORD = "sjhadiyans78213@";
const USER_NAME = "username";
export const USER_NAME_ID = "IanswerTestUser01";
const DAMMY_EMAIL = "ee68028@gmail.com";

export async function authenticate(): Promise<void> {
  try {
    console.log(await getCurrentUser());
  } catch (error) {
    const username = await getLocalStorage(USER_NAME);
    if (username) {
      await authSignIn(username);
    } else {
      // await authSignUp();
    }
  }
}

async function authSignIn(username: string): Promise<void> {
  try {
    const info = await signIn({
      username: username,
      password: GUEST_PASSWORD,
      options: {
        authFlowType: "USER_PASSWORD_AUTH",
      },
    });
    console.log(info);
  } catch (error) {
    // alert("error signing in");
    // alert(error);
    console.error(error);
    // await authSignUp();
  }
}

async function authSignUp(): Promise<void> {
  try {
    const username: string = USER_NAME_ID;
    // const username: string = uuidv4();
    const userInfo = await signUp({
      username: username,
      password: GUEST_PASSWORD,
      options: {
        userAttributes: {
          email: DAMMY_EMAIL,
        },
      },
    });
    saveLocalStorage(USER_NAME, username);
    console.log(userInfo);
  } catch (error) {
    // alert("error signing up");
    // alert(JSON.stringify(error, null, 2));
    console.error("error signing up:", error);
  }
}
