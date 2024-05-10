import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import type { ImageProps } from "../utils/types";

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
  const router = useRouter();

  useEffect(() => {
    router.push("/girl");
  }, []);

  return null;
};

export default Home;
