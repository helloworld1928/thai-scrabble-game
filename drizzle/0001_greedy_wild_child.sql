CREATE TABLE `dictionary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(100) NOT NULL,
	`definition` text,
	`category` varchar(50),
	`difficulty` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dictionary_id` PRIMARY KEY(`id`),
	CONSTRAINT `dictionary_word_unique` UNIQUE(`word`)
);
--> statement-breakpoint
CREATE TABLE `game_moves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameId` int NOT NULL,
	`moveNumber` int NOT NULL,
	`player` enum('player','ai') NOT NULL,
	`word` varchar(100),
	`positions` text,
	`score` int NOT NULL DEFAULT 0,
	`action` enum('place','swap','pass') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_moves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('playing','finished','abandoned') NOT NULL DEFAULT 'playing',
	`playerScore` int NOT NULL DEFAULT 0,
	`aiScore` int NOT NULL DEFAULT 0,
	`currentTurn` enum('player','ai') NOT NULL DEFAULT 'player',
	`boardState` text NOT NULL,
	`playerTiles` varchar(50) NOT NULL,
	`aiTiles` varchar(50) NOT NULL,
	`tileBag` text NOT NULL,
	`winner` enum('player','ai','draw'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`finishedAt` timestamp,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gamesPlayed` int NOT NULL DEFAULT 0,
	`gamesWon` int NOT NULL DEFAULT 0,
	`gamesLost` int NOT NULL DEFAULT 0,
	`gamesDraw` int NOT NULL DEFAULT 0,
	`totalScore` int NOT NULL DEFAULT 0,
	`highestScore` int NOT NULL DEFAULT 0,
	`averageScore` int NOT NULL DEFAULT 0,
	`longestWord` varchar(100),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_stats_userId_unique` UNIQUE(`userId`)
);
