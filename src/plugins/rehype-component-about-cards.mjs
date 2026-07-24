import fs from "node:fs";
import path from "node:path";
import { h } from "hastscript";
import { aboutCardSections } from "../data/about-cards.ts";

const publicDirectory = path.resolve("public");

function getImageUrl(image) {
	if (image.startsWith("http")) return image;
	const publicUrl = image.startsWith("/")
		? image
		: `/images/${image.split("/").map(encodeURIComponent).join("/")}`;
	const pathname = publicUrl.split("?", 1)[0];
	const filePath = path.resolve(publicDirectory, `.${decodeURIComponent(pathname)}`);

	if (!filePath.startsWith(`${publicDirectory}${path.sep}`)) return publicUrl;

	try {
		const version = Math.trunc(fs.statSync(filePath).mtimeMs).toString(36);
		return `${publicUrl}${publicUrl.includes("?") ? "&" : "?"}v=${version}`;
	} catch {
		return publicUrl;
	}
}

export function AboutCardsComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0) {
		return h("div", { class: "about-cards-error" }, [
			'Invalid directive. Use ::about-cards or ::about-cards{section="Section title"}.',
		]);
	}

	const requestedSection =
		typeof properties.section === "string" ? properties.section.trim() : "";
	const sections = requestedSection
		? aboutCardSections.filter((section) => section.title === requestedSection)
		: aboutCardSections;

	if (sections.length === 0) {
		return h(
			"div",
			{ class: "about-cards-error" },
			`About card section not found: ${requestedSection}`,
		);
	}

	return h(
		"div",
		{ class: "about-card-groups not-prose" },
		sections.map((section) =>
			h("section", { class: "about-card-section" }, [
				h("div", { class: "about-card-section-title" }, [
					section.title,
					h("span", { class: "about-card-section-accent" }),
				]),
				h(
					"div",
					{ class: "about-card-grid" },
					section.cards.map((card) =>
						h("article", { class: "about-info-card" }, [
							...(card.image
								? [
										h("div", { class: "about-info-card-image-wrap" }, [
											h("img", {
												src: getImageUrl(card.image),
												alt: card.imageAlt || card.title,
												loading: "eager",
												class: "about-info-card-image",
											}),
										]),
									]
								: []),
							h("div", { class: "about-info-card-content" }, [
								h("div", { class: "about-info-card-title" }, card.title),
								...(card.description
									? [
											h(
												"p",
												{ class: "about-info-card-description" },
												card.description,
											),
										]
									: []),
							]),
						]),
					),
				),
			]),
		),
	);
}
