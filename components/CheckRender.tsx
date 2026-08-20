import { FC, ReactNode } from "react";

interface CheckRenderProps {
    allowed?: boolean;
    children: ReactNode;
}

const CheckRender: FC<CheckRenderProps> = ({ allowed = false, children }) => {
    return allowed ? children : null;
};

export default CheckRender;
