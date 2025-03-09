import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import isEmpty from "lodash/isEmpty";
import { getSearchParams } from "@/app/utils/url";

export type User = {
  name: string;
  email: string;
  image?: string;
  avatar?: string;
  id: string;
  provider: string;
  authenticated: boolean;
  phone?: string;
};

export type Operate = {
  new_user?: boolean;
};

export const USER_DATA_CACHE_KEY = "diago_fake_user_version_2";

const DEFAULT_STATE = {
  user: {} as User,
  operate: {} as Operate,
  country: "default",
  isShowGGTipsIcon: true,
  isShowTakeTry: true,
};

export const useUserStore = createPersistStore(
  { ...DEFAULT_STATE },

  (set, get) => ({
    isOfficialUser() {
      return (
        get().user.authenticated && get().user.email?.endsWith("@rpggo.ai")
      );
    },
    isNewUser() {
      const { from } = getSearchParams();
      if (from === "creator") return false;
      if (get().user.authenticated) return get().operate?.new_user !== false;
      else return false;
    },
    hideGGTipsIcon() {
      set({
        isShowGGTipsIcon: false,
      });
    },
    hideTakeTry() {
      set({
        isShowTakeTry: false,
      });
    },
    login({ user, operate }: { user: User; operate: Operate }) {
      if (isEmpty(user)) return;
      set(() => ({
        user: {
          ...user,
          avatar: user?.image,
          authenticated: !(user.provider === "rpggo"),
        },
        operate,
      }));
    },
    setCountry(country: string) {
      set({ country });
    },
  }),
  {
    name: StoreKey.User,
  },
);
