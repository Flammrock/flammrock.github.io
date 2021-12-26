#include <stdio.h>
#include <math.h> // sqrt


/**********************\
*                      *
*   STRUCT & TYPEDEF   *
*                      *
\**********************/

typedef struct Point {
    double x;
    double y;
} Point;

typedef struct Line {
    Point a;
    Point b;
} Line;

typedef struct Vector {
    double x;
    double y;
} Vector;



/**********************\
*                      *
*     POINT CLASS      *
*                      *
\**********************/

Point point_create(double x, double y) {
    return (Point){x,y};
}
void point_display(Point p) {
    printf("Point (%f,%f)\n",p.x,p.y);
}



/**********************\
*                      *
*      LINE CLASS      *
*                      *
\**********************/

Line line_create(Point a, Point b) {
    return (Line){a,b};
}
void line_display(Line l) {
    printf("Line (%f,%f) -> (%f,%f)\n",l.a.x,l.a.y,l.b.x,l.b.y);
}
Vector line_get_vector(Line l) {
    return (Vector){l.b.x-l.a.x,l.b.y-l.a.y};
}



/**********************\
*                      *
*     VECTOR CLASS     *
*                      *
\**********************/

Vector vector_create(double x, double y) {
    return (Vector){x,y};
}
void vector_display(Vector v) {
    printf("Vector (%f,%f)\n",v.x,v.y);
}
double vector_dot(Vector v1, Vector v2) {
    return v1.x*v2.x + v1.y*v2.y;
}
double vector_length(Vector v) {
    return sqrt(vector_dot(v,v));
}
Vector vector_normalize(Vector v) {
    double length = vector_length(v);
    return (Vector){v.x/length,v.y/length};
}
Vector vector_add(Vector v1, Vector v2) {return (Vector){v1.x+v2.x,v1.y+v2.y};}
Vector vector_sub(Vector v1, Vector v2) {return (Vector){v1.x-v2.x,v1.y-v2.y};}
Vector vector_add_scalar(Vector v, double s) {return (Vector){v.x+s,v.y+s};}
Vector vector_sub_scalar(Vector v, double s) {return (Vector){v.x-s,v.y-s};}
Vector vector_mul_scalar(Vector v, double s) {return (Vector){v.x*s,v.y*s};}
Vector vector_div_scalar(Vector v, double s) {return (Vector){v.x/s,v.y/s};}


/**********************\
*                      *
*         MAIN         *
*                      *
\**********************/

///[ENTRY_POINT]
int main() {

    Point mypoint = point_create(5.0,2.0);
    point_display(mypoint);



    Point mypoint2 = point_create(1.0,4.0);
    Line myline = line_create(mypoint,mypoint2);
    line_display(myline);

    Vector myvector = line_get_vector(myline);
    vector_display(myvector);




    return 0;
}
