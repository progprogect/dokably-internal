import { Role } from "@entities/models/role";

export type RolesForChange = Exclude<Role, 'guest' | 'admin'>;

export type MemberOptionType = {
    title: string;
    description: string;
    icon?: React.FunctionComponent<
      React.SVGProps<SVGSVGElement> & {
        title?: string | undefined;
      }
    >;
    disabled: boolean;
    comingSoon?: boolean;
  };

export type RolesOptionsMap = Record<RolesForChange, MemberOptionType>;
export type GuestOptionsMap = Record<'guest', MemberOptionType>;