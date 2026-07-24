export type AboutCard = {
	title: string;
	description?: string;
	image?: string;
	imageAlt?: string;
};

export type AboutCardSection = {
	title: string;
	cards: AboutCard[];
};

// Add local images to public/images and use their filename here. Complete https
// URLs and public paths beginning with "/" are also supported.
export const aboutCardSections: AboutCardSection[] = [
	{
		title: "喜欢的番剧",
		cards: [
			{
				title: "无职转生：到了异世界就要拿出真本事",
				description: "Cumulonimbus！",
				image: "A1.webp",
				imageAlt: "二次元作品插图",
			},
			{
				title: "总之就是非常可爱",
				description: "总之就是非常酸",
				image: "A2.webp",
				imageAlt: "二次元作品插图",
			},

		],
	},
	{
		title: "喜欢的游戏",
		cards: [
			{
				title: "绝区零",
				description: "喜欢安静、无人打扰的房间，自己做喜欢的事。",
				image: "B3.webp",
				imageAlt: "二次元作品插图",
			},
			{
				title: "Minecraft",
				description: "讨厌麻烦，不重要的事情尽量保持简单。",
				image: "B5.webp",
				imageAlt: "二次元作品插图",
			},
			{
				title: "明日方舟",
				description: "常常留下未完成的计划，还在努力提升执行力。",
				image: "B4.webp",
				imageAlt: "二次元作品插图",
			},
		],
	},
];

/*
Card template:
{
	title: "Card title",
	description: "Optional description",
	image: "example.webp",
	imageAlt: "Image description",
},
*/
