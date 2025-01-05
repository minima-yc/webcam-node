# webcam-node

Node JS code for downloading videos from the Minima Yacht Club webcam, processing and uploading to storage.

## Performance

Transcoding six 300 second videos (i.e. 30 minutes) with 180x speed up (10
seconds) takes 18 minutes (1096 s) on a Raspberry Pi 4 (SD card with only 1G) -
this is not going to work.

Not sure if NVMe will be a big improvement, RAM probably will be  and the speed
of the Pi 5 will obviously help.

24 hours on 6x2 core i7 used the whole CPU and 31 GB ram for nearly 26 minutes
(1,536 s)
