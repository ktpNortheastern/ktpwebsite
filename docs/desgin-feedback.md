Page load in animation: https://www.awwwards.com/inspiration/presskit-ascii-carles-faus



Navbar
Cursor should be a black dot, not circle, and have different effects: smaller when hovering over interactable (links, buttons, etc)
Special hover effect for “Rush Now” type buttons: https://www.rekorderstudios.com/
Hover over any of the buttons from that link and notice how the text moves up and down sorta like an arcade machine - looking to recreate that for both the text and arrow on hover for the buttons
Nav Bar load in animation (all Home Page text animate in first, then Nav Bar)
Text scramble effect AND caption/cursor scramble effect: https://www.pinterest.com/pin/621496817369902812/




Home Page
Header text & tagline should be further up the screen
“Omega chapter … ” text line and “the premiere …” text line should less kerning (less space between the text lines)
“vv scroll down to learn more vv” should have a small idle hover effect
Text appear animation: https://www.awwwards.com/inspiration/scroll-animation-kiriyamagumi-co-ltd


Presidential Welcome Page
Center image + text
Image height should be the same as text box
New text from Andrew:
Hi everyone! We are Andrew Rettig and Eleanor (Ellie) Meltzer, and we are thrilled to welcome you to the Omega chapter of Kappa Theta Pi at Northeastern University.

Kappa Theta Pi is the largest professional co-ed technology fraternity in the world, with over 800 members nationally. Our chapter brings together members of all majors and backgrounds, united by a common goal of excellence and positive impact throughout our lifelong journey.

For both of us, joining KTP has shaped our time at Northeastern more than we ever expected. We both joined freshman year, not really knowing what to expect, and it ended up giving us so much more than we imagined professionally, socially, and academically.

Professionally, we've had mentors push us to apply for co-ops and internships we weren't sure we were ready for, help us prep for interviews, and give us honest feedback on our resumes when we needed to hear it. That kind of support doesn't happen by accident, it’s built into the culture here, and it's something we want to keep alive for all of you.

Socially, some of our closest friends at Northeastern came from this chapter. The late night study sessions, the group dinners, the random weekday hangouts, those are the moments that make this place feel like home away from home. Academically, we've leaned on brothers to get through tough classes, share notes, and just remind each other that we're not doing this alone.

We are incredibly honored to serve as your Presidents, and we take seriously the responsibility of carrying forward what so many members before us built. This chapter has a legacy of mentorship, ambition, and genuine care for one another, and our goal this year is to make sure every one of you feels that same sense of belonging and support that we did when we first walked in.

We're so excited for what this year has in store, and we can't wait to get to know each of you. We encourage you to experience our community firsthand by attending recruitment events and exploring the rest of our website.

Welcome to KTP.

Eleanore (Ellie) Meltzer
Andrew Rettig
Omega Chapter Presidents



“We are the first prof… ” Text Page
Text should be bigger
Scroll effect: link https://josh-torre.github.io/#about-me
Dotted background texture should fade in and out (I’m not talking abt animation, just the way it looks)


History Page
Center everything


Pillars Page
Perfect!
Effects idk where it would go but keeping it here for bookmark https://scrollart.org/sine-message/


Why Rush Page
Changing sections should be centered horizontally
Changing sections transition should be softer
Currently, there’s a scroll effect on “Why Rush” text + Brothers button. That is the correct transition that I was envisioning, but that scroll effect should be on the entire page as a whole when scrolling away – not just on that section itself
Visually what I mean for the scroll effect: https://drive.google.com/file/d/1rPxpBIjM4MTolAxVfHr2C8apim0W-H0i/view?usp=sharing
Probs add 1 pic each under each section

DEFERRED — whole-page "card lift" scroll effect (2026-08-29): reference is
rekorderstudios.com, same site as the button hover reference below. Investigated
live in Chrome by sampling computed styles (transform, border-radius) on the
outgoing section across a scroll range through the transition boundary — found
NO animated transform on the section itself (transform stayed "none" the whole
way through). The rounded corners present on section wrappers are a static,
always-on style, not scroll-driven. Best guess, unconfirmed: the "shrink and
round" look is an illusion from position:sticky stacking — the outgoing section
stays pinned while the next section's straight top edge rides up over it, so
its visible remaining area shrinks and its permanently-rounded trailing corners
are the last thing visible before it's fully covered. Could not rule out a
canvas/WebGL layer or another wrapper doing it instead. Not building this yet —
it would require WhyRush's exit to become a second pinned scroll range on top
of its existing internal card-crossfade pin, and SnapScrollContainer's
getSnapInfo() would need to key its next snap point off that pin's end rather
than the section's raw offsetTop. Revisit only if we're willing to touch the
snap system, or find a cleaner reference implementation.


Network
No need for text, only wordmarks
Logos Order:
OpenAI
NVIDIA
Google
SpaceX
Microsoft
AWS
Perplexity AI
Ramp
LinkedIn
Adobe
Figma
IBM
Sony Music
BlackRock
JPMorgan
Morgan Stanley
Bain Capital
BCG
Deloitte
PwC
EY
Point72
Millennium
Fidelity Investments
Wellington Management
Regeneron
NASA
Raytheon
Salesforce
ServiceNow
WHOOP
DraftKings
State Street
Scotiabank
Jefferies
Klaviyo
SharkNinja
MORSE Corp
UKG
Chewy
Chick-fil-A
CBAI


FAQ
Divider line under FAQ should be same color as FAQ text color


Footer
Need proper padding on left/right sides
Add icons in this order: Instagram, LinkedIn, Email, GitHub
ΚΘΠ text should be larger for hierarchy purposes
Text scramble effect on load
