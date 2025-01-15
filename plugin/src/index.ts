import {ConfigPlugin} from '@expo/config-plugins';
import withIdNowPermissions from "./withIdNowPermissions";
import withIdNowAutoIdent from "./withIdNowAutoIdent";

const withIDNow: ConfigPlugin = (config) => {
    config = withIdNowPermissions(config);
    config = withIdNowAutoIdent(config);

    return config;
};

export default withIDNow;
