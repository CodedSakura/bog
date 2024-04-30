[meta:author]:# 'CodedSakura'
[meta:number]:# '002'
[meta:projects]:# 'LED driver'
[meta:started_on]:# '2024-03-31'
[meta:published]:# 'false'
[meta:published_on]:# '2000-01-01'
[meta:last_updated_on]:# '2024-03-31'
[meta:tags]:# 'Electronics,LED,ESP32,PCB,SMD'
[meta:permalink]:# 'https://bog.codedsakura.dev/posts/002'


# Wireless LED driver and controller - #002

Who doesn't want pretty RGB LEDs in their room?


## Problem definition

I want a fully programmable LED driver for multi-color 12V/24V LED strips.

It has to be powered entirely off the LED strip input voltage, support up to 5
channels (Red, Green, Blue, White, Warm White), have a Wi-Fi enabled 
microcontroller, use PWM for brigtness control, and has to be quiet.


## Driving options

I do not have a lot of experience in electronics, but I do know MOSFETs are good
at translating a 3V3 or 5V control PWM signal (from microcontroller) to the
12 or 24 volts required to drive the LEDs. I also know MOSFETs can get pretty
hot after continuous use.

So my first thought was to somehow multiplex a single MOSFET across the 5 
channels. But after talking to some people who _do_ actually know stuff about
electronics, I decided to go the easier path.

Idea two -- just use 5 mosfets. They wouldn't need to be all that powerful as
the strip I want to run is less than 5 meters long. So they're not gonna get
all that hot. Also they're gonna be small enough to not take up heaps of space.


## Circuit design

With the help of the same people who get electronics, I got some base designs
of a MOSFET controlled single-channel driver, that works off 3V3 (see below).

![Single-channel MOSFET diagram](./001-single-channel.png)

With that diagram I went to design the full diagram. But I had no prior 
experience with any apps that can do that! So I had to learn one.

[KiCad][1] is a FOSS circuit and PCB CAD application. Learning it was fairly
quick, and soon enough I was pretty fluent in basics of the schematic editor.
It does have plenty of Jank, but that's expected from software that does about
50 different tasks...

With the help of internet resources and some advice I drew up a schematic:

![Circuit schematic](./002-schematic.png)