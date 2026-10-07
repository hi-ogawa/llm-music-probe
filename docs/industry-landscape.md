# How the music industry uses AI (as of October 2026)

Research date: 2026-10-08. Every claim carries a source and the source's date. Claims are marked by status:

- **Established** means a primary source (company announcement, court filing or ruling as reported by trade press, survey publisher) or several independent reports agree.
- **Claimed** means a company or interested party says it and nobody independent has confirmed it.
- **Unverified** means I found it only in a secondary or single source and could not check the original.

The question this serves is how much of the work of composers, arrangers, producers, and session musicians is already programmed or automated, and which roles still depend on humans.

## 1. AI inside DAWs and production tools

### Generated session-player parts

Apple's Logic Pro is the clearest mainstream example of a DAW that generates instrumental parts. Logic Pro 11 (announced 2024-05-07) extended the long-standing Drummer into "Session Players" with a new Bass Player and Keyboard Player, which follow a Chord Track and take controls for complexity and intensity. Apple says "Bass Player was trained in collaboration with today's best bass players using advanced AI and sampling technologies", but it did not name the players or describe the model. The same release added Stem Splitter (on-device separation into drums, bass, vocals, and other) and ChromaGlow (AI-modeled saturation). Status: established (Apple announcement). Source: [Apple Newsroom, 2024-05-07](https://www.apple.com/newsroom/2024/05/logic-pro-takes-music-making-to-the-next-level-with-new-ai-features/).

Logic Pro 12 (January 2026) added a Synth Player, which generates synth bass and keyboard parts in styles such as 808 Bass, Pump Bass, Sequenced Bass, Simple Pad, Modulated Pad, and Rhythmic Chords. It also added Chord ID, which extracts a chord progression from an audio or MIDI region so that Session Players can follow it. Status: established. Sources: [Apple Newsroom, Apple Creator Studio, January 2026](https://www.apple.com/newsroom/2026/01/introducing-apple-creator-studio-an-inspiring-collection-of-creative-apps/), [Apple Logic Pro release notes, accessed 2026-10-08](https://support.apple.com/en-us/109503), [Apple Support, Synth Player styles, accessed 2026-10-08](https://support.apple.com/guide/logicpro/intro-to-synth-player-styles-lgcpc49d7e59/mac), [CDM hands-on, 2026-01-28](https://cdm.link/logic-pro-12-hands-on/). Logic 12.3 (mid-2026) improved Chord ID on solo instruments, inversions, and seventh chords, according to [Synth Anatomy, June 2026](https://synthanatomy.com/2026/06/apple-logic-pro-12.html) (unverified against Apple's notes beyond the "improved performance" line on the Apple support page).

The pattern matters for this repository. The parts Apple automates are accompaniment roles (drums, bass, comping keys, pads) that follow a harmonic plan the user supplies. I found no mainstream DAW feature that generates a lead melody as a session player.

### Stem separation and MIDI generators

Stem separation is now a built-in DAW feature, not a specialist service. Ableton Live 12.3 added stem separation (Suite only, built on Music.AI algorithms) plus a "Generators" MIDI pack that includes an acid-bassline generator and a percussion-variation tool. Status: established. Sources: [MusicTech, late 2025](https://musictech.com/news/music/ableton-live-12-3/), [Attack Magazine, 2025](https://www.attackmagazine.com/news/splice-integration-and-stem-seperation-arrive-in-ableton-live-12-3-beta/). Logic has had Stem Splitter since 2024 (Apple source above).

### Chord, melody, and MIDI assistants

Third-party MIDI generators exist, but most do not use general text LLMs. A roundup by AudioCipher (dated Sep 8, year not shown) lists AudioCipher (rule-based, "home brewed text-to-MIDI algorithm"), Hookpad Aria (fine-tuned from the Anticipatory Music Transformer, a symbolic model), Lemonaide (models trained on individual artists' projects), AIVA, and Unison MIDI Wizard. Only MIDI Agent and WavTool are described as LLM-driven. Source: [AudioCipher, accessed 2026-10-08](https://www.audiocipher.com/post/ai-midi-generators). Status: the tool descriptions are vendor self-descriptions relayed by a vendor of a competing tool.

### DAW integrations with LLM agents (MCP)

No major DAW vendor ships a first-party LLM agent that I could find. Integrations are community projects using the Model Context Protocol (MCP):

- **Ableton Live.** [ahujasid/ableton-mcp](https://github.com/ahujasid/ableton-mcp) (accessed 2026-10-08) runs a Remote Script socket server inside Live and lets an MCP client create tracks, write MIDI notes into clips, load instruments and effects, build arrangement sections, and control transport. It showed about 3.1k GitHub stars at time of access. It does not render audio, so the LLM writes notes and the user's instruments perform them. Status: established (repository).
- **REAPER.** Several servers exist, for example [total-reaper-mcp](https://glama.ai/mcp/servers/shiehn/total-reaper-mcp) and [reaper-mcp](https://glama.ai/mcp/servers/T-Rzeznik/reaper-mcp), covering tracks, MIDI notes, FX parameters, automation, and rendering (directory listings, accessed 2026-10-08). Status: unverified beyond directory listings.
- **Logic Pro.** Servers such as [MongLong0214/logic-pro-mcp](https://glama.ai/mcp/servers/MongLong0214/logic-pro-mcp) and [rubenknol/logic-pro-mcp](https://glama.ai/mcp/servers/rubenknol/logic-pro-mcp) work around the lack of a scripting API with AppleScript, accessibility APIs, Mackie Control, and virtual MIDI (accessed 2026-10-08). Status: unverified beyond listings.
- **FL Studio.** Servers such as [flemcee](https://pypi.org/project/flemcee/) exist, but one README notes the FL scripting API cannot load new plugins or create patterns ([karl-andres/fl-studio-mcp README](https://glama.ai/mcp/servers/@karl-andres/fl-studio-mcp/blob/05595015e7c825d83a6639a66e25abb5fac8b28d/README.md), accessed 2026-10-08).

I found no adoption data for any of these. They look like hobbyist and developer tools, not part of professional workflows (inference).

## 2. AI mixing and mastering

Products: iZotope Ozone (Master Assistant) and Neutron (Mix Assistant) are assistant modes that analyze audio and set conventional processors, which the engineer then adjusts. iZotope itself avoids the "auto-mixing" label. Status: claimed by vendor, relayed by [Age of Audio (iZotope interview), undated](https://www.ageofaudio.com/en/iZotope%3A-The-Future-of-Artificial-Intelligence-in-Mixing-and-Mastering/). RoEx Automix takes stems and returns a full mix, including an Ableton integration ([Electronic Groove, undated](https://electronicgroove.com/roex-launches-ai-powered-mixing-integration-for-ableton-live/)). Online mastering (LANDR and others) is a mature consumer service.

Adoption among working creators: in the Sound On Sound and Sonarworks survey (published 2026-02-04, n=1,194, 43% producers, 21% engineers), 58% use AI audio restoration, 38% mixing assistants, 33.9% mastering services, and 20.9% composition tools. Status: established as the publisher's figures. Source: [Sonarworks, 2026-02-04](https://www.sonarworks.com/blog/research/future-music-production-human-producer-survey-2026).

How professionals regard quality: the most cited controlled test is Benn Jordan's double-blind mastering comparison (472 listeners). Two human engineers placed first and second, ahead of Matchering 2.0, Ozone plus Neutron, and others, and LANDR was eliminated before the final. Source: [MusicTech, 2024-10-29](https://musictech.com/news/gear/benn-jordan-ai-mastering-study). It is a single track and a YouTube-run test, so treat it as indicative. I found no 2026 controlled comparison. The common professional view in commentary is that automated mastering has taken the low-budget "utility" work while top-end mastering stays human, but that view comes from commentary sites, not data ([CareerExplorer, undated](https://www.careerexplorer.com/careers/mastering-engineer/ai-impact/)). Status: unverified opinion.

## 3. How much music is programmed, and how library, game, and screen music are changing

### Programmed versus played

I could not find a study that measures the share of released music that is programmed rather than played, by genre. This is a real gap. Practitioner sources say most commercial pop, hip-hop, R&B, and EDM drums are programmed and that session drum demand has fallen, while jazz, metal, prog, and rock still largely need live drums ([Soundfly Flypaper, undated](https://flypaper.soundfly.com/play/could-the-next-questlove-be-c-3po-the-plight-of-the-session-drummer/)). A qualitative academic study of German studio musicians found that shrinking budgets, project studios, and remote collaboration make a living from studio work "hardly possible" in Germany ([University of Huddersfield repository, undated record](https://pure.hud.ac.uk/en/publications/the-work-realities-of-professional-studio-musicians-in-the-german/)). Status: unverified as quantities, plausible as direction. The Sonarworks survey above reports respondents see "digital-workflow and functional genres" as more automatable and "improvisational, ensemble, and performance-based genres" as more resistant, without numbers.

Important for this repository: "programmed" in pop has meant human-programmed MIDI and samples for decades, which is different from AI-generated. The new change is that the programming itself (writing the part) is starting to be automated, starting with accompaniment (section 1).

### Production and library music

- CISAC's study (with PMP Strategy, 2024-12-04) forecasts that generative AI music will take about 60% of music-library revenues and about 20% of streaming platform revenues by 2028, and that 24% of music creators' revenues are at risk by 2028 under unchanged regulation. Status: established as CISAC's forecast, which is an interested party's projection, not measured data. Source: [CISAC, 2024-12-04](https://www.cisac.org/Newsroom/news-releases/global-economic-study-shows-human-creators-future-risk-generative-ai).
- Epidemic Sound launched "Adapt" (September 2025), which edits length, structure, mood, and instrumentation of its own catalog tracks and is trained only on music it licenses ([Epidemic Sound, accessed 2026-10-08](https://www.epidemicsound.com/fr/ai/)). Status: claimed by company. I found no Epidemic text-to-music generator.
- A production duo reportedly sued Suno in 2026 claiming sync income fell nearly 80% ([LabelGrid blog, 2026](https://labelgrid.com/blog/content-distribution/sync-licensing-for-independent-artists-in-the-ai-era/)). Status: unverified, because I did not find the filing.

### Game audio

GDC's 2026 State of the Game Industry survey (2,300+ respondents) found 52% think generative AI is harming the industry, up from 30% the year before ([Business Wire, 2026-01-29](https://www.businesswire.com/news/home/20260129438528/en/2026-State-of-the-Game-Industry-Report-Reveals-Widening-Effect-of-Layoffs-Broader-Perspectives-on-Generative-AI-Unionization-Tariffs-and-More)). It does not break out audio roles in the material I found. GameSoundCon's 2025 game audio survey says generative AI use in game audio is "still relatively rare" and that the most common uses are dialogue generation and scripting (for example REAPER or Python), not music ([GameSoundCon, 2025](https://www.gamesoundcon.com/post/gamesoundcon-game-audio-industry-survey-2025)). The figure "8% use generative AI, 15% exploring" comes from a secondary blog ([Voxbooster, 2026](https://voxbooster.com/blog/game-audio-industry-statistics-2026)) and is unverified.

### Film and TV mockups

I found no 2026 survey of film and TV composers on AI. Orchestral mockups built from sample libraries are standard in film, TV, and games, and Sound On Sound attributes this to budget pressure, not new technology ([Sound On Sound, undated](https://www.soundonsound.com/techniques/daw-score)). A 2024 Soundtrack Cologne and LIVE Innovation survey of film-music professionals found low AI adoption and high concern about job loss, from a non-representative sample ([Soundtrack Cologne PDF, 2024](https://soundtrackcologne.de/media/5618/live-am-artist-monitor-2024-film-media-music-ai-6.pdf)). The claim that composers now pair AI sketches with sample-library mockups appears only in career-advice pages and vendor copy. Status: unverified.

## 4. End-to-end generators and the labels

### Suno

- The majors (UMG, Sony, Warner) sued Suno in 2024. Warner settled in November 2025 with a licensing deal covering opt-in artists' voices, names, likenesses, and compositions, a commitment to launch licensed models in 2026 and retire old ones, no downloads for free users and download caps for paid users. Suno also bought Songkick from Warner. Source: [Music Business Worldwide, November 2025](https://www.musicbusinessworldwide.com/warner-music-group-settles-with-suno-strikes-first-of-its-kind-deal-with-ai-song-generator/). Status: established.
- On 2026-09-09 Suno launched v6, v6-wild (Pro and Premier only), and v6-mini (all users), developed with Warner, BMG, and Believe, and retired all earlier models. Suno has not said which catalogs trained v6 or how artists will be paid. Free songs cannot be downloaded, and paid users have monthly download caps. Source: [The Next Web, 2026-09-09](https://thenextweb.com/news/suno-v6-warner-bmg-believe-licensed-models). Status: launch established, training claims are Suno's.
- On 2026-09-18 Sony and UMG filed a new 45-page suit in the District of Massachusetts arguing that v6 was trained on outputs of earlier allegedly infringing models, which "launders" the infringement rather than removing it. It names 60,202 recordings. Suno called the claims "fundamentally flawed" and said v6 was trained on licensed partner content, community interactions, and its own team's work. Source: [Variety, 2026-09-19](https://au.variety.com/2026/music/news/sony-music-universal-music-sue-suno-label-backed-model-40495/). Status: established that the suit was filed. The allegations are claims.
- In Germany, the Munich Regional Court I (case 42 O 763/25) largely ruled for GEMA against Suno, finding that songs were memorized in v3.5 and v4 and reproduced in outputs, and rejecting the text-and-data-mining exception and fair use defenses. The judgment is first-instance and damages are not set. Source: [bonedo.de, 2026](https://www.bonedo.de/artikel/gema-gewinnt-gegen-suno-urteil-setzt-ki-musik-unter-druck/). One report dates it 2026-07-31 ([delamar.de, 2026](https://www.delamar.de/musikbusiness/gema-vs-suno-gerichtsurteil-v9-89621/)). Status: established as reported by German trade press. I did not read the judgment.
- Suno bought the browser DAW WavTool in June 2025, which had stem separation, AI MIDI generation, and an in-app chatbot ([Suno blog, June 2025](https://suno.com/blog/suno-acquires-wavtool)). Suno Studio now exports multitrack WAV stems and offers "Get MIDI" transcription from a stem ([Suno Help Center, accessed 2026-10-08](https://help.suno.com/en/articles/8128193)). A third-party report says Studio 2.0 (2026-08-13) added MIDI on the timeline ([Dubspot blog, 2026](https://blog.dubspot.com/suno-studio-2-0)), which is unverified against Suno. The MIDI here is transcribed from generated audio, so the symbolic layer is derived, not authored (inference from the help-center description).

### Udio

- UMG settled with Udio on 2025-10-29 and Warner in November 2025. Both deals turn Udio into a licensed "walled garden" where opt-in artists' music can be remixed and customized, but output cannot be downloaded or distributed off the platform. Sources: [Music Business Worldwide, 2025-10-29](https://www.musicbusinessworldwide.com/universal-music-settles-udio-lawsuit-strikes-deal-for-licensed-ai-music-platform/), [Billboard, November 2025](https://www.billboard.com/pro/warner-music-settles-udio-deal-ai-music-platform/). Status: established.
- As of July 2026 the new platform was still expected "during the remainder of 2026" ([Digital Music News, 2026-07-17](https://www.digitalmusicnews.com/2026/07/17/udio-buydrm-deal-walled-garden/)). I found no confirmed launch.
- Sony is still suing. A judge refused to let Sony add about 30,000 works to its first case, so Sony filed a second suit on 2026-07-20 with a YouTube stream-ripping (anti-circumvention) claim ([Digital Music News, 2026-07-20](https://www.digitalmusicnews.com/2026/07/20/sony-music-udio-infringement-lawsuit-second/)). Udio admitted obtaining YouTube audio for training while arguing fair use ([Music Business Worldwide, 2026](https://www.musicbusinessworldwide.com/udio-admits-to-scraping-youtube-audio-for-ai-training-in-answer-to-sony-music-lawsuit/)), and argues damages should be "as low as $200" per work ([Music Business Worldwide, 2026](https://www.musicbusinessworldwide.com/udio-continues-to-argue-that-its-ai-training-was-quintessential-fair-use-and-says-even-if-it-infringed-sony-musics-recordings-damages-should-be-as-low-as-200-per-work/)).

### Google Lyria

Lyria 3 launched in the Gemini app on 2026-02-18 with 30-second tracks and a SynthID watermark ([Google blog, February 2026](https://blog.google/innovation-and-ai/products/gemini-app/lyria-3/)). Lyria 3 Pro (2026-03-25) generates songs up to about three minutes and is available in Vertex AI (public preview), the Gemini API, Google Vids, the Gemini app, and ProducerAI ([Google blog, 2026-03-25](https://blog.google/innovation-and-ai/technology/ai/lyria-3-pro/)). Google partnered with Believe on "Flow Music", which runs on Lyria 3 Pro ([Google blog, 2026-05-06](https://blog.google/innovation-and-ai/models-and-research/google-labs/believe-flow-music-partnership/)). Status: established. I did not verify Google's commercial-use terms. Reports that Lyria 3 was trained on licensed data are unverified ([SiliconANGLE, 2026-02-18](https://siliconangle.com/2026/02/18/google-launches-lyria-3-music-generation-model/)).

### ElevenLabs

Eleven Music launched in August 2025, and the launch post says it is "cleared for nearly all commercial uses" ([ElevenLabs blog, August 2025](https://elevenlabs.io/blog/eleven-music-is-here)). Licensing partners are Merlin (independent labels) and Kobalt (publishing), with opt-in for artists ([Business Wire, 2025-08-05](https://www.businesswire.com/news/home/20250805333301/en)). Current ElevenLabs pages narrow this: film, TV, and large-studio game use need an Enterprise plan or an additional license ([ElevenLabs Music API page, accessed 2026-10-08](https://elevenlabs.io/eleven-music-api), [ElevenCreative page, accessed 2026-10-08](https://elevenlabs.io/creative)). Status: established as company terms.

### Others

- All three majors signed licensing deals with Klay Vision on 2025-11-20, the first startup to license from all three, for a service that remakes songs in different styles ([Relix, November 2025](https://relix.com/news/detail/major-labels-announce-deal-with-ai-music-startup/)). No launch found.
- UMG and Stability AI announced an alliance on 2025-10-30 to build "professional" licensed music-creation tools ([Music Business Worldwide, 2025-10-30](https://www.musicbusinessworldwide.com/umg-strikes-strategic-alliance-with-stability-ai-to-develop-next-generation-ai-music-making-tools)). The report that Stable Audio 3.0 shipped in May 2026 with a DAW plugin is unverified (search summary only).

### Legal backdrop

On 2026-09-29 the Third Circuit affirmed that ROSS Intelligence's use of Westlaw headnotes to train an AI was not fair use, the first US appellate fair-use ruling on AI training, though not a generative case. The RIAA and NMPA filed a brief supporting Thomson Reuters ([The Star / Reuters, 2026-09-30](https://www.thestar.com.my/tech/tech-news/2026/09/30/us-appeals-court-upholds-thomson-reuters039-landmark-win-in-ai-training-lawsuit)). Status: established. Its effect on the music cases is open.

### Distribution and platforms

- Deezer reported that fully AI-generated tracks passed 50% of daily uploads in June 2026 (about 90,000 a day), up from about 10% in January 2025, but they account for only 1 to 3% of streams, and up to 85% of their streams in 2025 were fraudulent ([Deezer newsroom, 2026-07-21](https://newsroom-deezer.com/2026/07/ai-music-exceeds-50-percent-daily-uploads-deezer/)). Status: established as Deezer's detector-based figures.
- In a Deezer and Ipsos survey of 9,000 adults in 8 countries, 97% could not identify which of three tracks were fully AI-generated ([Deezer newsroom, 2025-11-12](https://newsroom-deezer.com/2025/11/deezer-ipsos-survey-ai-music/)). This is a three-track test chosen by Deezer.
- Bandcamp banned music "generated wholly or in substantial part by AI" on 2026-01-13 ([Bandcamp blog, 2026-01-13](https://blog.bandcamp.com/2026-01-13/keeping-bandcamp-human)).
- Spotify backs a DDEX disclosure standard with separate fields for AI vocals, instrumentation, and post-production ([Spotify newsroom, 2025-09-25](https://newsroom.spotify.com/2025-09-25/spotify-strengthens-ai-protections/)), and in August 2026 added a label for AI-generated artist identities, separate from AI Credits ([Spotify newsroom, 2026-08-11](https://newsroom.spotify.com/2026-08-11/ai-persona-badges-transparency/)).

## 5. Surveys of working musicians and producers

Results depend heavily on who is asked and what counts as AI.

| Survey                                                                                                                                                                 | Date       | Sample                                           | Headline                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sound On Sound and Sonarworks ([source](https://www.sonarworks.com/blog/research/future-music-production-human-producer-survey-2026))                                  | 2026-02-04 | 1,194 creators, mostly experienced professionals | About 1 in 5 are regular AI users and about half occasional. Use is highest for restoration (58%), then mixing assistants (38%), mastering (33.9%), composition (20.9%). Top concern is loss of originality (77%).                |
| LANDR ([Ari Herstand summary](https://aristake.com/ai-tools-musicians-study/), [Hypebot](https://www.hypebot.com/new-survey-reveals-how-87-of-artists-really-use-ai/)) | late 2025  | 1,200+ from LANDR's own community                | 87% use AI somewhere. 79% for technical tasks, 66% for some creative use, 29% to generate vocals, drums, or instrumentals, 13% for whole songs. Beginners use song generators far more than professionals (51% versus about 25%). |
| GameSoundCon ([source](https://www.gamesoundcon.com/post/gamesoundcon-game-audio-industry-survey-2025))                                                                | 2025       | game audio professionals                         | Generative AI use "still relatively rare", mainly dialogue and scripting.                                                                                                                                                         |
| Uppbeat Creator Report ([Interspace summary](https://interspacemusic.com/blog/?p=18617))                                                                               | 2026       | 1,792 creatives incl. video creators             | About 60% willing to integrate AI tools. Only 6.7% accept fully AI-generated content. Unverified against the original.                                                                                                            |

The LANDR survey comes from a vendor of AI tools and its own user base, and the task percentages above come from a secondary write-up, so they are unverified against LANDR's report. The consistent finding across surveys is that professionals accept AI for technical chores (cleanup, separation, tuning, editing, mastering) and resist it for composition and aesthetic decisions.

## 6. LLM-based symbolic composition in real use

I found little evidence of general text LLMs being used for symbolic composition in professional work.

- **MIDI Agent** is a VST/AU plugin (launched around January 2026) that sends prompts to ChatGPT, Claude, or other LLM APIs and writes editable MIDI into the DAW. Sources are the vendor and a promotional post ([MIDI Agent, accessed 2026-10-08](https://www.midiagent.com/), [The Beat Community, 2026-01-12](https://thebeatcommunity.com/2026/01/12/midi-agent-chatgpt-inside-your-daw/)). Status: claimed. No usage data.
- **LLMidi** is an open-source VST3 that generates MIDI with local or online LLMs ([GitHub, accessed 2026-10-08](https://github.com/DirtyBeastAfterTheToad/LLMidi)). Hobby scale.
- **MCP servers** for Ableton, REAPER, Logic, and FL Studio (section 1) let an LLM agent write MIDI notes into a real session. They are the closest real-world analogue to this repository's setup. No adoption data.
- **WavTool**, now part of Suno, had a chatbot that could compose MIDI inside its DAW ([Suno blog, June 2025](https://suno.com/blog/suno-acquires-wavtool)).
- **Research systems** such as MIDI-LLM (a Llama 3.2 1B model with MIDI tokens added to its vocabulary, [arXiv 2511.03942, November 2025](https://arxiv.org/abs/2511.03942v1)) and Text2midi ([AAAI 2025](https://ojs.aaai.org/index.php/AAAI/article/view/34516)) are fine-tuned or purpose-built, not general LLMs prompted in text. Only MIDI-LLM reports a small user study.

The commercial momentum is in audio-domain generation (Suno, Udio, Lyria, ElevenLabs) and in purpose-trained symbolic models for accompaniment (Logic Session Players, Hookpad Aria). Symbolic output from general LLMs is a niche of plugins and MCP hobby projects (inference from the absence of adoption evidence, which is weaker than evidence of absence).

## What this means for this research

Everything in this section is inference.

1. **Accompaniment is the automated layer, melody is not.** The most mature commercial part generators (Logic's Drummer, Bass, Keyboard, and Synth Players, Ableton's Generators) produce rhythmic and harmonic support that follows a chord plan. None generate lead melodies. This matches the repository's finding that the model's rhythmic and harmonic intent is convincing while melodic lines are not, and it suggests the industry has found the same boundary. Accompaniment is constrained by groove and harmony and tolerates generic choices, while melody carries identity and phrasing.

2. **Performance nuance is where human value is concentrated.** Apple trained Bass Player "in collaboration with" real bassists and exposes slides, mutes, dead notes, and pickups as controls, which shows that commercial tools treat articulation as data captured from players, not something inferred from notes. Sonarworks respondents name musicality and emotional judgment as the skills that stay human. Session musicians' remaining value, in genres where they survive, is exactly the expressive layer (phrasing, dynamics, articulation) that the repository suspects is missing from the model's melodies. So adding CC11, articulation, and phrasing to the text score is testing the part of the job the industry has not automated, which makes it a meaningful probe rather than a cosmetic fix.

3. **Technical post-production is largely automated or assisted, creative authorship is not.** Restoration, stem separation, and mastering have majority or large-minority adoption among professionals. Composition tools sit around 20% among experienced professionals. Roles that depend on taste (top-end mastering, composing for picture, leading sessions) remain human in the evidence available, while utility work (budget mastering, library cues, demo parts) is the most exposed.

4. **End-to-end audio generation is legally unsettled and moving to walled gardens.** Label deals restrict downloads and off-platform use (Udio) or cap them (Suno), and Sony and UMG are still suing Suno. A symbolic pipeline that generates notes and renders them with the user's own instruments sidesteps training-data and output-rights questions in a way audio generators do not. This is an argument for the symbolic medium as a practical niche, not proof that it produces better music.

5. **The symbolic, general-LLM approach is under-explored in practice.** Real use is limited to plugins like MIDI Agent and community MCP servers, with no adoption or quality evidence. So there is no industry baseline to compare against, and the repository's ear-tested findings would be new information, not a replication.

6. **Gaps that limit these conclusions.** I found no quantitative data on the share of released music that is programmed versus played by genre, no 2026 survey of film and TV composers, and no controlled 2026 test of AI mixing. Conclusions about which roles "still depend on humans" therefore rest on surveys of attitudes and on what vendors have chosen to automate, not on measured labor-market outcomes.
