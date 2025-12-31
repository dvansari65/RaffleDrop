"use client"
import { motion } from "framer-motion";

interface ExploreHeadingProps {
  title1: string;
  title2: string;
}

function ExploreHeading({ title1, title2 }: ExploreHeadingProps) {
  const neonText = (text: string) =>
    text.split("").map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
        className="inline-block"
      >
        {char}
      </motion.span>
    ));

  return (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-5xl font-extrabold tracking-tight mb-6"
    >
      <span className="text-white">{neonText(title1)}</span>
      <span
        className="ml-3 bg-clip-text text-transparent gradient-neon animate-neon-pulse"
      >
        {neonText(title2)}
      </span>
    </motion.h1>
  );
}

export default ExploreHeading;
