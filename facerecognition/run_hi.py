import face_recognition as fr
import os
import cv2
import RPi.GPIO as GPIO
import numpy as np
from time import sleep
import pickle
import time
import requests
print("su")
import pyimgur
import requests 
import pyimgur
import requests 
print("su")
start = time.time()
PERIOD = 10
pir = 17
led_red = 23
led_green = 24
GPIO.setmode(GPIO.BCM)
GPIO.setup(pir, GPIO.IN)
arr = os.listdir("/home/pi/Desktop/face_rec/faces")
print(arr)
ree = arr[2:]
print(ree)

def send_pic(id):
    CLIENT_ID = "b70a9e7ac233435"
    PATH = "test.jpg"
    URL='https://api.imgur.com/3/upload'
    im = pyimgur.Imgur(CLIENT_ID)
    uploaded_image = im.upload_image(PATH, title="Uploaded with PyImgur")
    print(uploaded_image.title)
    print(uploaded_image.link)
    print(uploaded_image.size)
    print(uploaded_image.type)  
    link=uploaded_image.link
    pic=link[20:]
    idd = str(id)
    link='https://aifarmhouse.herokuapp.com/face?i='+pic[:7]+'&w='+idd
    r=requests.get(link)
    print(link)
    

def get_encoded_faces():
    print("encoded")
    encoded = {}

    for dirpath, dnames, fnames in os.walk("./faces"):
        for f in fnames:
            if f.endswith(".jpg") or f.endswith(".png"):
                face = fr.load_image_file("faces/" + f)
                encoding = fr.face_encodings(face)[0]
                encoded[f.split(".")[0]] = encoding
    print("end encoded")
    return encoded
    
def unknown_image_encoded(img):
    print("encoding")
    face = fr.load_image_file("faces/" + img)
    encoding = fr.face_encodings(face)[0]
    print("end encoding")
    return encoding

def classify_face(im):
    print("start classify")
    faces = get_encoded_faces()
    faces_encoded = list(faces.values())
    known_face_names = list(faces.keys())

    img = cv2.imread(im, 1)
 
    face_locations = fr.face_locations(img)
    unknown_face_encodings = fr.face_encodings(img, face_locations)

    face_names = []
    for face_encoding in unknown_face_encodings:
        matches = fr.compare_faces(faces_encoded, face_encoding)
        name = "Unknown"


        face_distances = fr.face_distance(faces_encoded, face_encoding)
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            name = known_face_names[best_match_index]

        face_names.append(name)

        for (top, right, bottom, left), name in zip(face_locations, face_names):
            cv2.rectangle(img, (left-20, top-20), (right+20, bottom+20), (255, 0, 0), 2)
            cv2.rectangle(img, (left-20, bottom -15), (right+20, bottom+20), (255, 0, 0), cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(img, name, (left -20, bottom + 15), font, 1.0, (255, 255, 255), 2)
    print("end classify")
    '''
while True:
    
    #cv2.imshow('Video', img)
    '''
    if cv2.waitKey(1) & 0xFF == ord('q'):
        return face_names 
    if time.time() > start + PERIOD:
        return face_names
    '''
    input_state = GPIO.input(pir)
    print(input_state)
    time.sleep(3)
    if input_state == 1:
        exec(open("face.py").read());
        send_pic()
        resu = classify_face("test.jpg")
        print(resu)
        try:
            result = resu[0]
            resuu = result+".jpg"
            print(resuu)
            print(resuu in ree)
            x = (resuu in ree)
            if x == True:
                print("yeeeeet")
        except:
            print("nooo")

        

'''
while True:
    input_state = GPIO.input(pir)
    print(input_state)
    time.sleep(3)
    if input_state == 1:
        exec(open("face.py").read());
        resu = classify_face("test.jpg")
        print(resu)
        try:
            arr = os.listdir("/home/pi/Desktop/face_rec/faces")
            print(arr)
            ree = arr[2:]
            print(ree)
            result = resu[0]
            resuu = result+".jpg"
            print(resuu)
            print(resuu in ree)
            x = (resuu in ree)
            if x == True:
                send_pic(1)
                print("允許進入")
                requests.get("https://aifarmhouse.herokuapp.com/dlib")
            else:
                send_pic(2)
        except:
            print("陌生人")
	
