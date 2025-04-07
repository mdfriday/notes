import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { ProjectProvider } from "@/core/domain";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import PhotosPage from "@/pages/photos";

function LanguageSwitcher() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const lang = location.pathname.split("/")[1];
    if (["en", "zh"].includes(lang)) {
      i18n.changeLanguage(lang);
      localStorage.setItem("APP_LANG", lang);
    } else {
      let appLang = localStorage.getItem("APP_LANG") || "";

      if (["en", "zh"].includes(appLang)) {
        navigate(`/${appLang}${location.pathname}`, { replace: true });
      } else {
        const userLang = navigator.language.startsWith("zh") ? "zh" : "en";

        navigate(`/${userLang}${location.pathname}`, { replace: true });
      }
    }
  }, [location, i18n]);

  return null;
}

function App() {
  return (
    <ProjectProvider>
      <LanguageSwitcher />
      <Routes>
        <Route element={<IndexPage />} path="/:lang" />
        <Route element={<DocsPage />} path="/:lang/docs" />
        <Route element={<PricingPage />} path="/:lang/pricing" />
        <Route element={<BlogPage />} path="/:lang/blog" />
        <Route element={<AboutPage />} path="/:lang/about" />
        <Route element={<PhotosPage />} path="/:lang/photos" />
      </Routes>
    </ProjectProvider>
  );
}

export default App;
