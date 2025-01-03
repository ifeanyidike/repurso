import React, { useState } from "react";
import { VideoCameraOutlined } from "@ant-design/icons";
import { Flex, Divider, Skeleton, Space } from "antd";

const LoadingSkeleton: React.FC = () => {
  const [active, setActive] = useState(false);

  return (
    <Flex gap="middle" vertical justify="center" align="center">
      <Skeleton.Node
        active={true}
        style={{
          width: 1120,
          height: 630,
        }}
      >
        <VideoCameraOutlined style={{ fontSize: 200, color: "#bfbfbf" }} />
      </Skeleton.Node>
      <Divider />
      <Space>
        <Skeleton.Button
          active={true}
          size={"large"}
          shape={"round"}
          block={true}
        />
        <Skeleton.Avatar active={true} size={"large"} shape={"square"} />
        <Skeleton.Input active={true} size={"large"} />
      </Space>
      <Skeleton.Node active={active} style={{ width: 1400, height: 200 }} />
    </Flex>
  );
};

export default LoadingSkeleton;
