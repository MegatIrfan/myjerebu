import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "MyJerebu",
  version: packageJson.version,
  copyright: `© ${currentYear}, MyJerebu Malaysia.`,
  meta: {
    title: "MyJerebu — Pemantauan Kualiti Udara & Jerebu Malaysia",
    description:
      "MyJerebu menyediakan pemantauan indeks kualiti udara (AQI / IPU) masa nyata, ramalan jerebu, dan analisis stesen pencemaran di seluruh Malaysia.",
  },
};
