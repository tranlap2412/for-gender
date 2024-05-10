import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Bridge from "../components/Icons/Bridge";
import Logo from "../components/Icons/Logo";
import Modal from "../components/Modal";
import cloudinary from "../utils/cloudinary";
import getBase64ImageUrl from "../utils/generateBlurPlaceholder";
import type { ImageProps } from "../utils/types";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";
import { usePathname } from "next/navigation";

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { photoId } = router.query;
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();
  const TABS = ["girl", "women", "boy", "men"];
  const [tab, setTab] = useState(TABS[0]);

  const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

  const handleSetTab = (tab: string) => {
    setTab(tab);
  };

  useEffect(() => {
    // This effect keeps track of the last viewed photo in the modal to keep the index page in sync when the user navigates back
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current.scrollIntoView({ block: "center" });
      setLastViewedPhoto(null);
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto]);
  console.log(pathname, "pathname");

  return (
    <>
      <Head>
        <title>Ahihi</title>
        <meta
          property="og:image"
          content="https://nextjsconf-pics.vercel.app/og-image.png"
        />
        <meta
          name="twitter:image"
          content="https://nextjsconf-pics.vercel.app/og-image.png"
        />
      </Head>
      <header className="fixed top-0 z-10 flex w-full items-center justify-center gap-5 rounded-lg bg-black p-5">
        <Link
          href={"/girl"}
          className={`${
            pathname.includes("/girl")
              ? "bg-pink-500 text-white"
              : "bg-white text-black"
          } rounded-lg  px-4 py-2 font-semibold transition-all duration-300 hover:-translate-y-1`}
        >
          For Girl
        </Link>
        <Link
          href={"/women"}
          className={`${
            pathname.includes("/women")
              ? "bg-pink-500 text-white"
              : "bg-white text-black"
          } rounded-lg  px-4 py-2 font-semibold transition-all duration-300 hover:-translate-y-1`}
        >
          For Women
        </Link>
        <Link
          href={"/boy"}
          className={`${
            pathname.includes("/boy")
              ? "bg-pink-500 text-white"
              : "bg-white text-black"
          } rounded-lg  px-4 py-2 font-semibold transition-all duration-300 hover:-translate-y-1`}
        >
          For Boy
        </Link>
        <Link
          href={"/men"}
          className={`${
            pathname.includes("/men")
              ? "bg-pink-500 text-white"
              : "bg-white text-black"
          } rounded-lg  px-4 py-2 font-semibold transition-all duration-300 hover:-translate-y-1`}
        >
          For Men
        </Link>
      </header>
      <main className="mx-auto mt-20 max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              setLastViewedPhoto(photoId);
            }}
          />
        )}
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          {images.map(({ id, public_id, format, blurDataUrl }) => (
            <Link
              key={id}
              href={`men/?photoId=${id}`}
              as={`/p/${id}`}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              shallow
              className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
            >
              <Image
                alt="Next.js Conf photo"
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: "translate3d(0, 0, 0)" }}
                placeholder="blur"
                loading="lazy"
                blurDataURL={blurDataUrl}
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${public_id}.${format}`}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
              />
            </Link>
          ))}
        </div>
      </main>
      <footer className="p-6 text-center text-white/80 sm:p-12">
        Thank you for viewing our products. 💗 Products of Bond and Co Luong
      </footer>
    </>
  );
};

export default Home;

export async function getStaticProps({ params }) {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER_MEN}/*`)
    .sort_by("public_id", "desc")
    .max_results(400)
    .execute();
  let reducedResults: ImageProps[] = [];
  console.log(params, "hmm");

  let i = 0;
  for (let result of results.resources) {
    reducedResults.push({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
    });
    i++;
  }

  const blurImagePromises = results.resources.map((image: ImageProps) => {
    return getBase64ImageUrl(image);
  });
  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

  for (let i = 0; i < reducedResults.length; i++) {
    reducedResults[i].blurDataUrl = imagesWithBlurDataUrls[i];
  }

  return {
    props: {
      images: reducedResults,
    },
  };
}
