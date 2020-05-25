#include <WiFiClient.h>
#include <HTTPClient.h>
#include <Timer.h>
#include <NewPing.h>
#include "DHT.h"

//input
#define DHTTYPE DHT22
#define DHTPIN 21
#define soil 34
NewPing sonar(33,32,200);//(Trig,Echo,Distance);
//test
//test
//output
#define water_motor 0
#define light1 4
#define door 2
#define fan 16

//.......Counter........
Timer t1;

//............Temp&Humid Dectect....................
int msgcnt=0 ,humid;
DHT dht(DHTPIN, DHTTYPE);
float t , h;

//WiFi Connection
const char* ssid = "QAQ";
const char* pass = "0908223560";


void setup() {
  Serial.begin(9600);
  dht.begin();  
  WiFi.begin(ssid, pass);
  while(WiFi.status()!=WL_CONNECTED){
    delay(1000);
    Serial.println(".");
  }
  
  //input
  pinMode(soil , INPUT);
  //output
  pinMode(water_motor, OUTPUT);
  pinMode(door, OUTPUT);
  pinMode(light1 , OUTPUT);
  pinMode(fan , OUTPUT);


  digitalWrite(water_motor,LOW );
  digitalWrite(door,LOW );
  digitalWrite(light1,LOW );
  digitalWrite(fan,LOW );

  //timer
  t1.every(1000, temp); 
  t1.every(500,watering);
  t1.every(1000,fetch);
  t1.every(1000,fetchli);
  t1.every(2000,sonarde);
}

void loop(){
  t1.update();  
}

void temp (){
    HTTPClient http;
    float ht = dht.readHumidity();
    float tt = dht.readTemperature();
      t=tt;
      h=ht;
      String temp ,humid;
    temp=String(t);
    humid=String(h);
    String a="/th?t="+temp+"&h="+humid;
    Serial.println(a);
    http.begin("aifarmhouse.herokuapp.com", 80, a);
    http.GET();
}


void fetch(){
  HTTPClient a;
  a.begin("aifarmhouse.herokuapp.com", 80 , "/door");
  a.GET();
  String payload = a.getString();
  Serial.print(payload);
  if(payload=="true"){
    digitalWrite(door,HIGH);
    
  }
  else if(payload=="0"){
    digitalWrite(door, LOW);
    
  }
}

void fetchli(){
  HTTPClient c;
  c.begin("aifarmhouse.herokuapp.com", 80 , "/appliance");
  c.GET();
  String payload = c.getString();
  //Serial.print(payload);
  if(payload=="true"){
    digitalWrite(light1,HIGH);
    digitalWrite(fan, HIGH);
  }
  else if(payload=="false"){
    digitalWrite(light1,LOW );
    digitalWrite(fan, LOW);
  }
}

void watering(){
  humid=analogRead(soil);
  Serial.println(humid);
  if (humid<300){
    digitalWrite(water_motor,HIGH);
    }
  else if(humid>1000){
     digitalWrite(water_motor,LOW);
  }
}

void sonarde()
{ 
  HTTPClient so;
  int us,cm;
  String wei;
  us = sonar.ping(); //get sonar vaul
  cm=sonar.convert_cm(us);
  //Serial.print(sonar.convert_cm(us)); //convert origional vaul to cm
  //Serial.println("cm");
  if(cm>10&&msgcnt==0){
    so.begin("aifarmhouse.herokuapp.com", 80 , "/sonar1?a=1");
    so.GET();
    msgcnt=1;
    }
  else if(msgcnt==1&&cm<4){
    so.begin("aifarmhouse.herokuapp.com", 80 , "/sonar1?a=0");
    so.GET();
    msgcnt=0;
  }
  else if(cm==0){
    }
  wei=String(cm);
  wei="/sonar?w="+wei+"&h="+humid;
  so.begin("aifarmhouse.herokuapp.com", 80 , wei);
  so.GET();
  Serial.println(wei);
  }
