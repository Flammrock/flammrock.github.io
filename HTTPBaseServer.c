/*********************************************************************************\
* Copyright (c) 2020 Lemmy Briot (Flammrock)                                      *
*                                                                                 *
* Permission is hereby granted, free of charge, to any person obtaining a copy    *
* of this software and associated documentation files (the "Software"), to deal   *
* in the Software without restriction, including without limitation the rights    *
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell       *
* copies of the Software, and to permit persons to whom the Software is           *
* furnished to do so, subject to the following conditions:                        *
*                                                                                 *
* The above copyright notice and this permission notice shall be included in all  *
* copies or substantial portions of the Software.                                 *
*                                                                                 *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR      *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,        *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     *
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER          *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,   *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE   *
* SOFTWARE.                                                                       *
\*********************************************************************************/

/**
 * CROSS-PLATFORM
 *
 *    - Compiled Success with GCC (mingw) under Windows 10
 *    - Compiled Success with GCC under Ubuntu (Linux)
 */

// To compile for windows, use -DWIN32
// To compile for linux, use -Dlinux





/**********************\
*                      *
*       INCLUDE        *
*                      *
\**********************/


// some basics headers
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h> // strlen
#include <time.h>
#include <math.h>
#include <ctype.h> // tolower


// hack tricks lambda function (only available on gcc)
// https://blog.noctua-software.com/c-lambda.html
#define LAMBDA(c_) ({ c_ _;})

// used to compute sha1 algorithm for websocket usage
#include "teeny-sha1.c"

#define _WIN32_WINNT 0x0A00

// facilitates the creation of thread both on windows and linux with the same syntax
#include "fixpthread.h"
#include "thd.c"



#ifdef WIN32

    // all we need for use socket in windows are in the <winsock2.h> header
    #include <winsock2.h>

#elif defined(linux)

    // on linux, it's a bit different, we need different headers

    #include <sys/types.h>
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h> /* close */
    #include <netdb.h> /* gethostbyname */
    #include <pthread.h>

    #define INVALID_SOCKET - 1
    #define SOCKET_ERROR - 1
    #define closesocket(s) close(s)
    
    // just for a better read of the code
    typedef int SOCKET;
    typedef struct sockaddr_in SOCKADDR_IN;
    typedef struct sockaddr SOCKADDR;
    typedef struct in_addr IN_ADDR;

#else

    // throw error to not allow to the compiler to finish the compilation
    #error not defined for this platform

#endif



/**********************\
*                      *
*        MACRO         *
*                      *
\**********************/

#define CRLF "\r\n"
#define MAX_CLIENTS 100

#define BUF_SIZE 1024
typedef struct {
    SOCKET sock;
}
Client;

/**********************\
*                      *
*       SERVER         *
*                      *
\**********************/

char *reply = 
"HTTP/1.1 200 OK\n"
"Date: Thu, 19 Feb 2009 12:27:04 GMT\n"
"Server: Apache/2.2.3\n"
"Last-Modified: Wed, 18 Jun 2003 16:05:58 GMT\n"
"ETag: \"56d-9989200-1132c580\"\n"
"Content-Type: text/html\n"
"Content-Length: 15\n"
"Accept-Ranges: bytes\n"
"Connection: keep-alive\n"
"\n"
"sdfkjsdnbfkjbsf";


static void init(void);
static void end(void);

static void print_time(void) {
    time_t t = time(NULL);
    struct tm tm = *localtime(&t);
    printf("%02dh%02d",tm.tm_hour,tm.tm_min);
}

static void init(void) {
    #ifdef WIN32
    WSADATA wsa;
    int err = WSAStartup(MAKEWORD(2, 2), & wsa);
    if (err < 0) {
        puts("WSAStartup failed !");
        exit(EXIT_FAILURE);
    }
    #endif
}

static void end(void) {
    #ifdef WIN32
    WSACleanup();
    #endif
}







/**********************\
*                      *
*       HELPER         *
*                      *
\**********************/

static char* hex_2_base64(char *_hex) {
  char *hex_2_bin[16] = { "0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111" };
  char *dec_2_base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  //allocating memory for binary string
  int bin_size = strlen(_hex) * 4;
  while (bin_size % 6 != 0) //add space for zero padding
    bin_size += 8;
  char *bin = malloc(bin_size + 1);
  memset(bin, 0, bin_size + 1);

  //these are for strtol, its arguments need the zero terminator
  char buf[2] = { 0 };
  char b64buf[6 + 1] = { 0 };

  //converting hex input to binary
  char *bin_end = bin;
  for (int i = 0; i < strlen(_hex); i++)
  {
    buf[0] = _hex[i];
    memcpy(bin_end, hex_2_bin[strtol(buf, NULL, 16)], 4);
    bin_end += 4;
  }

  //pad binary string w/ zeroes
  while (strlen(bin) < bin_size)
    strcat(bin, "00000000");

  //allocating memory for b64 output
  int b64size = (strlen(bin) / 6) + 1;
  char *out = malloc(b64size);
  memset(out, 0, b64size);

  //walk through binary string, converting chunks of 6 bytes into base64 chars
  char *bin_ptr = bin;
  char *out_end = out;
  int index_b64;
  while (*bin_ptr)
  {
    strncpy(b64buf, bin_ptr, 6);
    index_b64 = strtol(b64buf, NULL, 2);
    if (index_b64 == 0)
      buf[0] = '=';
    else
      buf[0] = dec_2_base64[index_b64];
    memcpy(out_end, buf, 1);
    out_end += 1;
    bin_ptr += 6;
  }

  free(bin);
  return out;
}

#if defined(WIN32) && !defined(__MINGW32__)
#define CLOCK_REALTIME 0
static int g_first_time = 1;
static LARGE_INTEGER g_counts_per_sec;
static struct timespec { long tv_sec; long tv_nsec; };
static int clock_gettime(int dummy, struct timespec *ct) {
    LARGE_INTEGER count;

    if (g_first_time) {
        g_first_time = 0;

        if (0 == QueryPerformanceFrequency(&g_counts_per_sec)) {
            g_counts_per_sec.QuadPart = 0;
        }
    }

    if ((NULL == ct) || (g_counts_per_sec.QuadPart <= 0) || (0 == QueryPerformanceCounter(&count))) {
        return -1;
    }

    ct->tv_sec = count.QuadPart / g_counts_per_sec.QuadPart;
    ct->tv_nsec = ((count.QuadPart % g_counts_per_sec.QuadPart) * 1e9) / g_counts_per_sec.QuadPart;

    return 0;
}
#endif

static int strcmpinsensitive(const char* a, const char* b){
    unsigned int size1 = strlen(a);
    if (strlen(b) != size1) return -1;
    for (unsigned int i = 0; i < size1; i++) {
        if (tolower(a[i]) != tolower(b[i])) {
            return -1;
        }
    }
    return 0;
}
static int strncmpinsensitive(const char* a, const char* b, unsigned int l){
    unsigned int size1 = strlen(a);
    if (size1 < l) return -1;
    if (strlen(b) < l) return -1;
    for (unsigned int i = 0; i < l; i++) {
        if (tolower(a[i]) != tolower(b[i])) {
            return -1;
        }
    }
    return 0;
}




/**********************\
*                      *
*      TREE DATA       *
*      STRUCTURE       *
*                      *
\**********************/

// data structure namespaced with "http_" and "HTTP_"
// not static used -> available outside file for better experience usage

/**
 * HTTP_Node: Represent a Node of a Tree
 *
 *   - Use String as Key
 *   - Use Pointer (void*) as Data (so any type od data can be stored in the tree)
 *
 * Key are compared with strcmp() function of <string.h> header
 */
typedef struct HTTP_Node {
    char* key;
    void* data;
} HTTP_Node;

/**
 * HTTP_Tree: Represent a "Binary Tree" data structure with a child left and a child right that represent other "Binary Tree"
 */
typedef struct HTTP_Tree {
    struct HTTP_Tree *left;
    struct HTTP_Tree *right;
    HTTP_Node* node;
} HTTP_Tree;

/**
 *  \brief function that print all nodes of a tree (in infix order)
 *  
 *  \param [in] t a Binary Tree
 */
void http_tree_print(HTTP_Tree* t) {
    if (t == NULL) return;
    if (t->node == NULL) return;
    if (t->left != NULL) http_tree_print(t->left);
    printf("node '%s'\n",t->node->key);
    if (t->right != NULL) http_tree_print(t->right);
}

/**
 *  \brief Create a Binary Tree
 *  
 *  \return returns a binary tree
 *  
 *  \details - will return a NULL pointer if malloc fails
 *           - must be free later with the "void http_tree_free(HTTP_Tree* t)" function
 */
HTTP_Tree* http_tree_create() {
    HTTP_Tree* t = (HTTP_Tree*)malloc(sizeof(HTTP_Tree));
    if (!t) return NULL;
    memset(t, 0, sizeof(HTTP_Tree));
    t->left = NULL;
    t->right = NULL;
    t->node = NULL;
    return t;
}

/**
 *  \brief Free resource alloued by "http_node_create", free an HTTP_Node
 *  
 *  \param [in] n a node of a tree
 */
void http_node_free(HTTP_Node* n) {
    if (n) {
        if (n->key != NULL) {
            free(n->key);
            n->key = NULL;
        }
        n->data = NULL;
        free(n);
    }
}

/**
 *  \brief Free resource alloued by "http_node_create", free an HTTP_Node, in addition, this function free data
 *  
 *  \param [in] n a node of a tree
 */
void http_node_free_all(HTTP_Node* n) {
    if (n) {
        if (n->key != NULL) {
            free(n->key);
            n->key = NULL;
        }
        if (n->data != NULL) {
            free(n->data);
            n->data = NULL;
        }
        free(n);
    }
}

/**
 *  \brief Free resource alloued by "http_tree_create", free an HTTP_Tree
 *  
 *  \param [in] t a binary tree
 */
void http_tree_free(HTTP_Tree* t) {
    if (t) {
        http_node_free(t->node);
        http_tree_free(t->left);
        http_tree_free(t->right);
        free(t);
    }
}

/**
 *  \brief Free resource alloued by "http_tree_create", free an HTTP_Tree, in addition, this function free data of all node
 *  
 *  \param [in] t a binary tree
 */
void http_tree_free_all(HTTP_Tree* t) {
    if (t) {
        http_node_free_all(t->node);
        http_tree_free_all(t->left);
        http_tree_free_all(t->right);
        free(t);
    }
}


/**
 *  \brief Create a Node more easly
 *  
 *  \param [in] key String wich is used to store the Node in a Tree
 *  \param [in] data Pointer wich can be a pointer of anything
 *  \return returns an HTTP_Node* Object
 *  
 *  \details Later, it's important to free the resource using "http_node_free" function
 */
HTTP_Node* http_node_create(char *key, void *data) {
    HTTP_Node* n = (HTTP_Node*)malloc(sizeof(HTTP_Node));
    if (!n) return NULL;
    memset(n, 0, sizeof(HTTP_Node));
    n->key = (char*)malloc((strlen(key)+1)*sizeof(char));
    n->key[0] = '\0';
    strcat(n->key,key);
    if (!(n->key)) {
        free(n);
        return NULL;
    }
    n->data = data;
    return n;
}

/**
 *  \brief Insert a node inside a binary tree
 *  
 *  \param [in] t a binary tree
 *  \param [in] n a node
 *  
 *  \details - This function duplicate the node by using a malloc, so if a malloc is used to create the "n" HTTP_Node* passed as argument,
 *           then it's important to free resource manually and "http_tree_free" will not free that resource (because the node is duplicated)
 *           - The complexity of this function is in O(log(n)) with n the number of nodes inside the tree
 */
void http_tree_insert(HTTP_Tree* t, HTTP_Node* n) {
    if (n == NULL) return;
    if (t->node == NULL) {
        t->node = http_node_create(n->key,n->data);
        return;
    }
    if (strcmp(t->node->key,n->key) < 0) {
        if (t->right == NULL) {
            t->right = http_tree_create();
            if (!(t->right)) return;
        }
        return http_tree_insert(t->right, n);
    } else if (strcmp(t->node->key,n->key) > 0) {
        if (t->left == NULL) {
            t->left = http_tree_create();
            if (!(t->left)) return;
        }
        return http_tree_insert(t->left, n);
    } else {
        free(t->node->key);
        free(t->node->data);
        free(t->node);
        t->node = http_node_create(n->key,n->data);
        return;
    }
}

/**
 *  \brief Get a node from a binary tree by key
 *  
 *  \param [in] t a binary tree
 *  \param [in] key string that is used to find the node with the same key
 *  \return returns a pointer of the node found, if nothing is found then this function return a NULL pointer
 *  
 *  \details The complexity of this function is in O(log(n)) with n the number of nodes inside the tree
 */
HTTP_Node* http_tree_get(HTTP_Tree* t, char* key) {
    if (t == NULL) return NULL;
    if (t->node == NULL) return NULL;
    if (strcmp(t->node->key,key) < 0) {
        return http_tree_get(t->right,key);
    } else if (strcmp(t->node->key,key) > 0) {
        return http_tree_get(t->left,key);
    } else {
        return t->node;
    }
}

/**
 *  \brief Merge a binary tree into an another tree
 *  
 *  \param [in] t1 a binary tree
 *  \param [in] t2 a binary tree
 *  
 *  \details - Warning: the "t2" binary tree is inserted inside the "t1" binary tree, no other binary tree is created and nothing is returned
 *           In addition, nothing is free, so after the execution of this function, "t1" contain "t1+t2" and t2 still "t2"
 *           - The complexity of this function is in O(n) with n the number of nodes inside the tree "t2"
 */
void http_tree_merge(HTTP_Tree* t1, HTTP_Tree* t2) {
    if (t1 == NULL) return;
    if (t2 == NULL) return;
    if (t2->node != NULL) {
        http_tree_insert(t1, t2->node);
        if (t2->left != NULL) http_tree_merge(t1,t2->left);
        if (t2->right != NULL) http_tree_merge(t1,t2->right);
    }
    return;
}

/**
 *  \brief Remove a Node from a Tree
 *  
 *  \param [in] t a binary tree
 *  \param [in] n a node
 *  
 *  \details The complexity of this function is in O(n) with n the number of nodes inside the tree "t"
 */
void http_tree_remove(HTTP_Tree* t, HTTP_Node* n) {
    if (t->node == NULL) {
        return;
    }
    if (strcmp(t->node->key,n->key) < 0) {
        return http_tree_remove(t->right, n);
    } else if (strcmp(t->node->key,n->key) > 0) {
        return http_tree_remove(t->left, n);
    } else {
        http_node_free(t->node);
        t->node = NULL;
        
        if (t->left != NULL) {
            HTTP_Tree* left = t->left;
            HTTP_Tree* right = t->right;
            t->left = NULL;
            t->right = NULL;
            http_tree_merge(t, left);
            if (right != NULL) http_tree_merge(t, right);
            http_tree_free(left);
            http_tree_free(right);
        } else if (t->right != NULL) {
            HTTP_Tree* right = t->right;
            t->right = NULL;
            http_tree_merge(t, right);
            http_tree_free(right);
        } else {
            free(t->node);
            free(t);
        }
        
        return;
    }
}

/**
 *  \brief Compute the length of a Tree
 *  
 *  \param [in] t a binary tree
 *  \return returns the length of the tree (the nomber of node inside the tree)
 *  
 *  \details The complexity of this function is in O(n) with n the number of nodes inside the tree "t"
 */
int http_tree_length(HTTP_Tree* t) {
    if (!t) return 0;
    if (!(t->node)) return 0;
    return 1 + http_tree_length(t->left) + http_tree_length(t->right);
}

/**
 *  \brief Compute the height of a Tree
 *  
 *  \param [in] t a binary tree
 *  \return returns the height of the tree (the biggest length recursion of the tree)
 *  
 *  \details The complexity of this function is in O(n) with n the number of nodes inside the tree "t"
 */
int http_tree_height(HTTP_Tree* t) {
    if (!t) return 0;
    if (!(t->node)) return 0;
    int n1 = 1 + http_tree_height(t->left);
    int n2 = 1 + http_tree_height(t->right);
    return n1 > n2 ? n1 : n2;
}

/**
 *  \brief Compute the width of a Tree
 *  
 *  \param [in] t a binary tree
 *  \return returns the width of the tree (the biggest number of node in the same level)
 *  
 *  \details The complexity of this function is in O(n) with n the number of nodes inside the tree "t"
 */
int http_tree_width(HTTP_Tree* t) {
    if (!t) return 0;
    if (!(t->node)) return 0;
    
    HTTP_Tree** list = (HTTP_Tree**)malloc(3*sizeof(HTTP_Tree*));
    list[0] = t;
    list[1] = NULL;
    
    int width = 1;
    int size = 2;
    int pos = 1;
    
    while (list[0]) {
        
        width = pos > width ? pos : width;
        
        int i = pos;
        while (i--) {
            
            HTTP_Tree* temp = list[0];
            int j = 0;
            while (list[j++]) list[j-1] = list[j];
            list[j-1] = NULL;
            if (pos > 0) pos--;
            
            if (temp->left) {
                if (temp->left->node) {
                    list[pos++] = temp->left;
                    if (pos+1 > size-1) {
                        size *= 2;
                        list = (HTTP_Tree**)realloc(list,(size+1)*sizeof(HTTP_Tree*));
                        list[size] = NULL;
                    }
                }
            }
            
            if (temp->right) {
                if (temp->right->node) {
                    list[pos++] = temp->right;
                    if (pos+1 > size-1) {
                        size *= 2;
                        list = (HTTP_Tree**)realloc(list,(size+1)*sizeof(HTTP_Tree*));
                        list[size] = NULL;
                    }
                }
            }
            
        }
        
    }
    
    free(list);
    
    return width;
}

/**
 *  \brief Flatten a Tree inside an array with the infix order (left, root, right)
 *  
 *  \param [in] t a binary tree
 *  \param [in] l an array of node elements
 *  \param [in] i a pointer to an integer used to fill the array
 *  \return returns -1 if the function fails and 0 if success
 *  
 *  \details The complexity of this function is in O(n) with n the number of nodes inside the tree "t"
 */
int http_tree_infix(HTTP_Tree* t, HTTP_Node** l, int* i) {
    if (!t) return 0;
    if (!(t->node)) return 0;
    int r = 0;
    if (t->left != NULL) r = http_tree_infix(t->left,l,i);
    if (r < 0) return r;
    l[*i] = http_node_create(t->node->key,t->node->data);
    if (!(l[*i])) {
        for (int j = 0; j < *i; j++) {
            if (l[j]!=NULL) http_node_free(l[j]);
        }
        return -1;
    }
    (*i)++;
    if (t->right != NULL) r = http_tree_infix(t->right,l,i);
    if (r < 0) return r;
    return 0;
}

/**
 *  \brief Create a Full Tree with an sorted array
 *  
 *  \param [in] t a binary tree
 *  \param [in] l an array of node elements
 *  \param [in] start integer used to select the node to insert inside the tree to build a full tree
 *  \param [in] end integer used to select the node to insert inside the tree to build a full tree
 *  
 *  \details The complexity of this function is in O(n) with n the number of nodes inside the array "l"
 */
void http_tree_compact_fill(HTTP_Tree* t, HTTP_Node** l, int start, int end) {
    if (start + 1 == end) return;
    int mid = (end + start) / 2;
    http_tree_insert(t,l[mid]);
    http_tree_compact_fill(t, l, start, mid);
    http_tree_compact_fill(t, l, mid, end);
}

/**
 *  \brief Convert a Tree into a Full Tree
 *  
 *  \param [in] t a binary tree
 *  \return returns -1 if the function fails and 0 if success
 *  
 *  \details The complexity of this function is in O(n) with n the number of nodes inside the tree "t"
 *  \see https://stackoverflow.com/questions/43662466/convert-a-not-full-binary-search-tree-to-full-binary-search-tree
 */
int http_tree_compact(HTTP_Tree* t) {
    
    if (!t) return 0;
    if (!(t->node)) return 0;
    
    int length = http_tree_length(t);
    int n = 0;
    if ((length & (length-1)) == 0) {
        n = length*2-1;
    } else {
        n = (int)pow((double)2,ceil(log2((double)length)))-1;
    }
    
    HTTP_Node** listtemp = (HTTP_Node**)malloc(length*sizeof(HTTP_Node*));
    if (!listtemp) return -1;
    
    HTTP_Node** list = (HTTP_Node**)malloc(n*sizeof(HTTP_Node*));
    if (!list) {
        free(listtemp);
        return -1;
    }
    
    int i = 0;
    if (http_tree_infix(t, listtemp, &i) < 0) {
        free(listtemp);
        free(list);
        return -1;
    }
    
    i = 0;
    int tj = 0;
    for (int j = 0; j < n; j++) {
        if (j < n - length + tj) {
            list[j++] = NULL;
            tj++;
        }
        list[j] = listtemp[i++];
    }
    
    HTTP_Tree* t1 = http_tree_create();
    
    http_tree_compact_fill(t1,list,0,n);
    
    http_node_free(t->node);
    if (t->left) http_tree_free(t->left);
    if (t->right) http_tree_free(t->right);
    
    for (int k = 0; k < n; k++) {
        if (list[k]!=NULL) http_node_free(list[k]);
    }
    
    t->node = t1->node;
    t->left = t1->left;
    t->right = t1->right;
    
    free(listtemp);
    free(list);
    
    free(t1);
    
    return 0;
}




/**********************\
*                      *
*       PARSER         *
*                      *
\**********************/

HTTP_Tree* http_parser(char *buffer, long int length, char separator, char separator2) {
    HTTP_Tree* t = http_tree_create();
    if (t==NULL) return NULL;
    
    long int raw_len = length;
    long int raw_pos = (long int)buffer;
    
    char sep[2];
    sep[0] = separator2;
    sep[1] = '\0';
    
    size_t i = 0;
    char *b = buffer;
    while (1) {
        int test = (long int)buffer-raw_pos >= raw_len;
        if (*buffer==separator || test) {
            if (i==0) {
                b++;
                buffer++;
                continue;
            }
            size_t raw_len = test?i+1:i;
            char *raw = (char*)malloc((raw_len+1)*sizeof(char));
            char *rawp = raw;
            if (raw==NULL) {
                http_tree_free_all(t);
                return NULL;
            }
            memcpy(raw, b, raw_len);
            b = buffer+1;
            raw[raw_len] = '\0'; 
            
            size_t key_len = strcspn(raw, sep);
            size_t value_len = 0;
            if (raw_len-key_len > 0) value_len = raw_len-key_len-1;
            
            char *key = (char*)malloc((key_len+1)*sizeof(char));
            if (key==NULL) {
                http_tree_free_all(t);
                free(raw);
                return NULL;
            }
            memcpy(key, raw, key_len);
            key[key_len] = '\0';
            raw+=key_len+1;
            
            char *value = (char*)malloc((value_len+1)*sizeof(char));
            if (value==NULL) {
                http_tree_free_all(t);
                free(key);
                free(raw);
                return NULL;
            }
            if (value_len > 0) memcpy(value, raw, value_len);
            value[value_len] = '\0';
            
            HTTP_Node* n = http_node_create(key, (void*)value);
            if (n==NULL) {
                http_tree_free_all(t);
                free(key);
                free(raw);
                return NULL;
            }
            
            http_tree_insert(t, n);
            
            http_node_free(n);
            
            free(key);
            free(rawp);
            i = -1;
            if (test) break;
        }
        buffer++;
        i++;
    }
    
    if (http_tree_compact(t) != 0) {
        http_tree_free_all(t);
        return NULL;
    }
    
    return t;
    
}







/**********************\
*                      *
*        HTTP          *
*                      *
\**********************/

/**
 * Amount of time that the server must wait when no incoming data before it close connection (on keep-alive connection)
 */
#define HTTP_SERVER_TIMEOUT_SECONDS_RCV 20

/*
 * Default Port for HTTP (non-secure)
 */
#define HTTP_SERVER_PORT 80

/*
 * Size of Buffer used to receive and send data
 */
#define HTTP_SERVER_BUFFER_SIZE 32

/*
 * Maximum bytes per request accepted by the server
 * Default value for most web servers is 8192 bytes
 */
#define HTTP_SERVER_MAX_BYTES_RECV 8192

/*
 * Status HTTP
 */
typedef struct HTTP_Status {
    int code;
    char *text;
} HTTP_Status;

//{ Status HTTP Macro
// 1xx Informational
#define HTTP_STATUS_CONTINUE                                        (HTTP_Status){100,"Continue"}
#define HTTP_STATUS_SWITCHING_PROTOCOLS                             (HTTP_Status){101,"Switching Protocols"}
#define HTTP_STATUS_PROCESSING                                      (HTTP_Status){102,"Processing (WebDAV)"}               
// 2xx Success
#define HTTP_STATUS_OK                                              (HTTP_Status){200,"OK"}                        
#define HTTP_STATUS_CREATED                                         (HTTP_Status){201,"Created"}                      
#define HTTP_STATUS_ACCEPTED                                        (HTTP_Status){202,"Accepted"}
#define HTTP_STATUS_NONAUTHORITATIVE_INFORMATION                    (HTTP_Status){203,"Non-Authoritative Information"}
#define HTTP_STATUS_NO_CONTENT                                      (HTTP_Status){204,"No Content"}
#define HTTP_STATUS_RESET_CONTENT                                   (HTTP_Status){205,"Reset Content"}
#define HTTP_STATUS_PARTIAL_CONTENT                                 (HTTP_Status){206,"Partial Content"}
#define HTTP_STATUS_MULTI_STATUS_WEBDAV                             (HTTP_Status){207,"Multi-Status (WebDAV)"}
#define HTTP_STATUS_ALREADY_REPORTED_WEBDAV                         (HTTP_Status){208,"Already Reported (WebDAV)"}
#define HTTP_STATUS_IM_USED                                         (HTTP_Status){226,"IM Used"}
// 3xx Redirection
#define HTTP_STATUS_MULTIPLE_CHOICES                                (HTTP_Status){300,"Multiple Choices"}
#define HTTP_STATUS_MOVED_PERMANENTLY                               (HTTP_Status){301,"Moved Permanently"}
#define HTTP_STATUS_FOUND                                           (HTTP_Status){302,"Found"}
#define HTTP_STATUS_SEE_OTHER                                       (HTTP_Status){303,"See Other"}
#define HTTP_STATUS_NOT_MODIFIED                                    (HTTP_Status){304,"Not Modified"}
#define HTTP_STATUS_USE_PROXY                                       (HTTP_Status){305,"Use Proxy"}
#define HTTP_STATUS_UNUSED                                          (HTTP_Status){306,"(Unused)"}
#define HTTP_STATUS_TEMPORARY_REDIRECT                              (HTTP_Status){307,"Temporary Redirect"}
#define HTTP_STATUS_PERMANENT_REDIRECT_EXPERIMENTAL                 (HTTP_Status){308,"Permanent Redirect (experimental)"}
// 4xx Client Error
#define HTTP_STATUS_BAD_REQUEST                                     (HTTP_Status){400,"Bad Request"}
#define HTTP_STATUS_UNAUTHORIZED                                    (HTTP_Status){401,"Unauthorized"}
#define HTTP_STATUS_PAYMENT_REQUIRED                                (HTTP_Status){402,"Payment Required"}
#define HTTP_STATUS_FORBIDDEN                                       (HTTP_Status){403,"Forbidden"}
#define HTTP_STATUS_NOT_FOUND                                       (HTTP_Status){404,"Not Found"}
#define HTTP_STATUS_METHOD_NOT_ALLOWED                              (HTTP_Status){405,"Method Not Allowed"}
#define HTTP_STATUS_NOT_ACCEPTABLE                                  (HTTP_Status){406,"Not Acceptable"}
#define HTTP_STATUS_PROXY_AUTHENTICATION_REQUIRED                   (HTTP_Status){407,"Proxy Authentication Required"}
#define HTTP_STATUS_REQUEST_TIMEOUT                                 (HTTP_Status){408,"Request Timeout"}
#define HTTP_STATUS_CONFLICT                                        (HTTP_Status){409,"Conflict"}
#define HTTP_STATUS_GONE                                            (HTTP_Status){410,"Gone"}
#define HTTP_STATUS_LENGTH_REQUIRED                                 (HTTP_Status){411,"Length Required"}
#define HTTP_STATUS_PRECONDITION_FAILED                             (HTTP_Status){412,"Precondition Failed"}
#define HTTP_STATUS_REQUEST_ENTITY_TOO_LARGE                        (HTTP_Status){413,"Request Entity Too Large"}
#define HTTP_STATUS_REQUEST_URI_TOO_LONG                            (HTTP_Status){414,"Request-URI Too Long"}
#define HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE                          (HTTP_Status){415,"Unsupported Media Type"}
#define HTTP_STATUS_REQUESTED_RANGE_NOT_SATISFIABLE                 (HTTP_Status){416,"Requested Range Not Satisfiable"}
#define HTTP_STATUS_EXPECTATION_FAILED                              (HTTP_Status){417,"Expectation Failed"}
#define HTTP_STATUS_I_M_A_TEAPOT_RFC_2324                           (HTTP_Status){418,"I'm a teapot (RFC 2324)"}
#define HTTP_STATUS_ENHANCE_YOUR_CALM_TWITTER                       (HTTP_Status){420,"Enhance Your Calm (Twitter)"}
#define HTTP_STATUS_UNPROCESSABLE_ENTITY_WEBDAV                     (HTTP_Status){422,"Unprocessable Entity (WebDAV)"}
#define HTTP_STATUS_LOCKED_WEBDAV                                   (HTTP_Status){423,"Locked (WebDAV)"}
#define HTTP_STATUS_FAILED_DEPENDENCY_WEBDAV                        (HTTP_Status){424,"Failed Dependency (WebDAV)"}
#define HTTP_STATUS_RESERVED_FOR_WEBDAV                             (HTTP_Status){425,"Reserved for WebDAV"}
#define HTTP_STATUS_UPGRADE_REQUIRED                                (HTTP_Status){426,"Upgrade Required"}
#define HTTP_STATUS_PRECONDITION_REQUIRED                           (HTTP_Status){428,"Precondition Required"}
#define HTTP_STATUS_TOO_MANY_REQUESTS                               (HTTP_Status){429,"Too Many Requests"}
#define HTTP_STATUS_REQUEST_HEADER_FIELDS_TOO_LARGE                 (HTTP_Status){431,"Request Header Fields Too Large"}
#define HTTP_STATUS_NO_RESPONSE_NGINX                               (HTTP_Status){444,"No Response (Nginx)"}
#define HTTP_STATUS_RETRY_WITH_MICROSOFT                            (HTTP_Status){449,"Retry With (Microsoft)"}
#define HTTP_STATUS_BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS_MICROSOFT  (HTTP_Status){450,"Blocked by Windows Parental Controls (Microsoft)"}
#define HTTP_STATUS_UNAVAILABLE_FOR_LEGAL_REASONS                   (HTTP_Status){451,"Unavailable For Legal Reasons"}
#define HTTP_STATUS_CLIENT_CLOSED_REQUEST_NGINX                     (HTTP_Status){499,"Client Closed Request (Nginx)"}
// 5xx Server Error
#define HTTP_STATUS_INTERNAL_SERVER_ERROR                           (HTTP_Status){500,"Internal Server Error"}
#define HTTP_STATUS_NOT_IMPLEMENTED                                 (HTTP_Status){501,"Not Implemented"}
#define HTTP_STATUS_BAD_GATEWAY                                     (HTTP_Status){502,"Bad Gateway"}
#define HTTP_STATUS_SERVICE_UNAVAILABLE                             (HTTP_Status){503,"Service Unavailable"}
#define HTTP_STATUS_GATEWAY_TIMEOUT                                 (HTTP_Status){504,"Gateway Timeout"}
#define HTTP_STATUS_HTTP_VERSION_NOT_SUPPORTED                      (HTTP_Status){505,"HTTP Version Not Supported"}
#define HTTP_STATUS_VARIANT_ALSO_NEGOTIATES_EXPERIMENTAL            (HTTP_Status){506,"Variant Also Negotiates (Experimental)"}
#define HTTP_STATUS_INSUFFICIENT_STORAGE_WEBDAV                     (HTTP_Status){507,"Insufficient Storage (WebDAV)"}
#define HTTP_STATUS_LOOP_DETECTED_WEBDAV                            (HTTP_Status){508,"Loop Detected (WebDAV)"}
#define HTTP_STATUS_BANDWIDTH_LIMIT_EXCEEDED_APACHE                 (HTTP_Status){509,"Bandwidth Limit Exceeded (Apache)"}
#define HTTP_STATUS_NOT_EXTENDED                                    (HTTP_Status){510,"Not Extended"}
#define HTTP_STATUS_NETWORK_AUTHENTICATION_REQUIRED                 (HTTP_Status){511,"Network Authentication Required"}
#define HTTP_STATUS_NETWORK_READ_TIMEOUT_ERROR                      (HTTP_Status){598,"Network read timeout error"}
#define HTTP_STATUS_NETWORK_CONNECT_TIMEOUT_ERROR                   (HTTP_Status){599,"Network connect timeout error"}
//}


/*
 * Mime Type HTTP
 */
typedef struct HTTP_Mimetype {
    char *ext;
    char *name;
    char *type;
} HTTP_Mimetype;


//{ MimeType Macro
#define HTTP_MIMETYPES_X3D            (HTTP_Mimetype){".x3d","3D Crossword Plugin","model/x3d+xml"}
#define HTTP_MIMETYPES_3GP            (HTTP_Mimetype){".3gp","3GP","video/3gpp"}
#define HTTP_MIMETYPES_3G2            (HTTP_Mimetype){".3g2","3GP2","video/3gpp2"}
#define HTTP_MIMETYPES_MSEQ           (HTTP_Mimetype){".mseq","3GPP MSEQ File","application/vnd.mseq"}
#define HTTP_MIMETYPES_PWN            (HTTP_Mimetype){".pwn","3M Post It Notes","application/vnd.3m.post-it-notes"}
#define HTTP_MIMETYPES_PLB            (HTTP_Mimetype){".plb","3rd Generation Partnership Project - Pic Large","application/vnd.3gpp.pic-bw-large"}
#define HTTP_MIMETYPES_PSB            (HTTP_Mimetype){".psb","3rd Generation Partnership Project - Pic Small","application/vnd.3gpp.pic-bw-small"}
#define HTTP_MIMETYPES_PVB            (HTTP_Mimetype){".pvb","3rd Generation Partnership Project - Pic Var","application/vnd.3gpp.pic-bw-var"}
#define HTTP_MIMETYPES_TCAP           (HTTP_Mimetype){".tcap","3rd Generation Partnership Project - Transaction Capabilities Application Part","application/vnd.3gpp2.tcap"}
#define HTTP_MIMETYPES_7Z             (HTTP_Mimetype){".7z","7-Zip","application/x-7z-compressed"}
#define HTTP_MIMETYPES_ABW            (HTTP_Mimetype){".abw","AbiWord","application/x-abiword"}
#define HTTP_MIMETYPES_ACE            (HTTP_Mimetype){".ace","Ace Archive","application/x-ace-compressed"}
#define HTTP_MIMETYPES_ACC            (HTTP_Mimetype){".acc","Active Content Compression","application/vnd.americandynamics.acc"}
#define HTTP_MIMETYPES_ACU            (HTTP_Mimetype){".acu","ACU Cobol","application/vnd.acucobol"}
#define HTTP_MIMETYPES_ATC            (HTTP_Mimetype){".atc","ACU Cobol","application/vnd.acucorp"}
#define HTTP_MIMETYPES_ADP            (HTTP_Mimetype){".adp","Adaptive differential pulse-code modulation","audio/adpcm"}
#define HTTP_MIMETYPES_AAB            (HTTP_Mimetype){".aab","Adobe (Macropedia) Authorware - Binary File","application/x-authorware-bin"}
#define HTTP_MIMETYPES_AAM            (HTTP_Mimetype){".aam","Adobe (Macropedia) Authorware - Map","application/x-authorware-map"}
#define HTTP_MIMETYPES_AAS            (HTTP_Mimetype){".aas","Adobe (Macropedia) Authorware - Segment File","application/x-authorware-seg"}
#define HTTP_MIMETYPES_AIR            (HTTP_Mimetype){".air","Adobe AIR Application","application/vnd.adobe.air-application-installer-package+zip"}
#define HTTP_MIMETYPES_SWF            (HTTP_Mimetype){".swf","Adobe Flash","application/x-shockwave-flash"}
#define HTTP_MIMETYPES_FXP            (HTTP_Mimetype){".fxp","Adobe Flex Project","application/vnd.adobe.fxp"}
#define HTTP_MIMETYPES_PDF            (HTTP_Mimetype){".pdf","Adobe Portable Document Format","application/pdf"}
#define HTTP_MIMETYPES_PPD            (HTTP_Mimetype){".ppd","Adobe PostScript Printer Description File Format","application/vnd.cups-ppd"}
#define HTTP_MIMETYPES_DIR            (HTTP_Mimetype){".dir","Adobe Shockwave Player","application/x-director"}
#define HTTP_MIMETYPES_XDP            (HTTP_Mimetype){".xdp","Adobe XML Data Package","application/vnd.adobe.xdp+xml"}
#define HTTP_MIMETYPES_XFDF           (HTTP_Mimetype){".xfdf","Adobe XML Forms Data Format","application/vnd.adobe.xfdf"}
#define HTTP_MIMETYPES_AAC            (HTTP_Mimetype){".aac","Advanced Audio Coding (AAC)","audio/x-aac"}
#define HTTP_MIMETYPES_AHEAD          (HTTP_Mimetype){".ahead","Ahead AIR Application","application/vnd.ahead.space"}
#define HTTP_MIMETYPES_AZF            (HTTP_Mimetype){".azf","AirZip FileSECURE","application/vnd.airzip.filesecure.azf"}
#define HTTP_MIMETYPES_AZS            (HTTP_Mimetype){".azs","AirZip FileSECURE","application/vnd.airzip.filesecure.azs"}
#define HTTP_MIMETYPES_AZW            (HTTP_Mimetype){".azw","Amazon Kindle eBook format","application/vnd.amazon.ebook"}
#define HTTP_MIMETYPES_AMI            (HTTP_Mimetype){".ami","AmigaDE","application/vnd.amiga.ami"}
#define HTTP_MIMETYPES_APK            (HTTP_Mimetype){".apk","Android Package Archive","application/vnd.android.package-archive"}
#define HTTP_MIMETYPES_CII            (HTTP_Mimetype){".cii","ANSER-WEB Terminal Client - Certificate Issue","application/vnd.anser-web-certificate-issue-initiation"}
#define HTTP_MIMETYPES_FTI            (HTTP_Mimetype){".fti","ANSER-WEB Terminal Client - Web Funds Transfer","application/vnd.anser-web-funds-transfer-initiation"}
#define HTTP_MIMETYPES_ATX            (HTTP_Mimetype){".atx","Antix Game Player","application/vnd.antix.game-component"}
#define HTTP_MIMETYPES_DMG            (HTTP_Mimetype){".dmg","Apple Disk Image","application/octet-stream"}
#define HTTP_MIMETYPES_MPKG           (HTTP_Mimetype){".mpkg","Apple Installer Package","application/vnd.apple.installer+xml"}
#define HTTP_MIMETYPES_AW             (HTTP_Mimetype){".aw","Applixware","application/applixware"}
#define HTTP_MIMETYPES_LES            (HTTP_Mimetype){".les","Archipelago Lesson Player","application/vnd.hhe.lesson-player"}
#define HTTP_MIMETYPES_SWI            (HTTP_Mimetype){".swi","Arista Networks Software Image","application/vnd.aristanetworks.swi"}
#define HTTP_MIMETYPES_S              (HTTP_Mimetype){".s","Assembler Source File","text/x-asm"}
#define HTTP_MIMETYPES_ATOMCAT        (HTTP_Mimetype){".atomcat","Atom Publishing Protocol","application/atomcat+xml"}
#define HTTP_MIMETYPES_ATOMSVC        (HTTP_Mimetype){".atomsvc","Atom Publishing Protocol Service Document","application/atomsvc+xml"}
#define HTTP_MIMETYPES_ATOM           (HTTP_Mimetype){".atom","Atom Syndication Format","application/atom+xml"}
#define HTTP_MIMETYPES_AC             (HTTP_Mimetype){".ac","Attribute Certificate","application/pkix-attr-cert"}
#define HTTP_MIMETYPES_AIF            (HTTP_Mimetype){".aif","Audio Interchange File Format","audio/x-aiff"}
#define HTTP_MIMETYPES_AVI            (HTTP_Mimetype){".avi","Audio Video Interleave (AVI)","video/x-msvideo"}
#define HTTP_MIMETYPES_AEP            (HTTP_Mimetype){".aep","Audiograph","application/vnd.audiograph"}
#define HTTP_MIMETYPES_DXF            (HTTP_Mimetype){".dxf","AutoCAD DXF","image/vnd.dxf"}
#define HTTP_MIMETYPES_DWF            (HTTP_Mimetype){".dwf","Autodesk Design Web Format (DWF)","model/vnd.dwf"}
#define HTTP_MIMETYPES_PAR            (HTTP_Mimetype){".par","BAS Partitur Format","text/plain-bas"}
#define HTTP_MIMETYPES_BCPIO          (HTTP_Mimetype){".bcpio","Binary CPIO Archive","application/x-bcpio"}
#define HTTP_MIMETYPES_BIN            (HTTP_Mimetype){".bin","Binary Data","application/octet-stream"}
#define HTTP_MIMETYPES_BMP            (HTTP_Mimetype){".bmp","Bitmap Image File","image/bmp"}
#define HTTP_MIMETYPES_TORRENT        (HTTP_Mimetype){".torrent","BitTorrent","application/x-bittorrent"}
#define HTTP_MIMETYPES_COD            (HTTP_Mimetype){".cod","Blackberry COD File","application/vnd.rim.cod"}
#define HTTP_MIMETYPES_MPM            (HTTP_Mimetype){".mpm","Blueice Research Multipass","application/vnd.blueice.multipass"}
#define HTTP_MIMETYPES_BMI            (HTTP_Mimetype){".bmi","BMI Drawing Data Interchange","application/vnd.bmi"}
#define HTTP_MIMETYPES_SH             (HTTP_Mimetype){".sh","Bourne Shell Script","application/x-sh"}
#define HTTP_MIMETYPES_BTIF           (HTTP_Mimetype){".btif","BTIF","image/prs.btif"}
#define HTTP_MIMETYPES_REP            (HTTP_Mimetype){".rep","BusinessObjects","application/vnd.businessobjects"}
#define HTTP_MIMETYPES_BZ             (HTTP_Mimetype){".bz","Bzip Archive","application/x-bzip"}
#define HTTP_MIMETYPES_BZ2            (HTTP_Mimetype){".bz2","Bzip2 Archive","application/x-bzip2"}
#define HTTP_MIMETYPES_CSH            (HTTP_Mimetype){".csh","C Shell Script","application/x-csh"}
#define HTTP_MIMETYPES_C              (HTTP_Mimetype){".c","C Source File","text/x-c"}
#define HTTP_MIMETYPES_CDXML          (HTTP_Mimetype){".cdxml","CambridgeSoft Chem Draw","application/vnd.chemdraw+xml"}
#define HTTP_MIMETYPES_CSS            (HTTP_Mimetype){".css","Cascading Style Sheets (CSS)","text/css"}
#define HTTP_MIMETYPES_CDX            (HTTP_Mimetype){".cdx","ChemDraw eXchange file","chemical/x-cdx"}
#define HTTP_MIMETYPES_CML            (HTTP_Mimetype){".cml","Chemical Markup Language","chemical/x-cml"}
#define HTTP_MIMETYPES_CSML           (HTTP_Mimetype){".csml","Chemical Style Markup Language","chemical/x-csml"}
#define HTTP_MIMETYPES_CDBCMSG        (HTTP_Mimetype){".cdbcmsg","CIM Database","application/vnd.contact.cmsg"}
#define HTTP_MIMETYPES_CLA            (HTTP_Mimetype){".cla","Claymore Data Files","application/vnd.claymore"}
#define HTTP_MIMETYPES_C4G            (HTTP_Mimetype){".c4g","Clonk Game","application/vnd.clonk.c4group"}
#define HTTP_MIMETYPES_SUB            (HTTP_Mimetype){".sub","Close Captioning - Subtitle","text/vnd.dvb.subtitle"}
#define HTTP_MIMETYPES_CDMIA          (HTTP_Mimetype){".cdmia","Cloud Data Management Interface (CDMI) - Capability","application/cdmi-capability"}
#define HTTP_MIMETYPES_CDMIC          (HTTP_Mimetype){".cdmic","Cloud Data Management Interface (CDMI) - Contaimer","application/cdmi-container"}
#define HTTP_MIMETYPES_CDMID          (HTTP_Mimetype){".cdmid","Cloud Data Management Interface (CDMI) - Domain","application/cdmi-domain"}
#define HTTP_MIMETYPES_CDMIO          (HTTP_Mimetype){".cdmio","Cloud Data Management Interface (CDMI) - Object","application/cdmi-object"}
#define HTTP_MIMETYPES_CDMIQ          (HTTP_Mimetype){".cdmiq","Cloud Data Management Interface (CDMI) - Queue","application/cdmi-queue"}
#define HTTP_MIMETYPES_C11AMC         (HTTP_Mimetype){".c11amc","ClueTrust CartoMobile - Config","application/vnd.cluetrust.cartomobile-config"}
#define HTTP_MIMETYPES_C11AMZ         (HTTP_Mimetype){".c11amz","ClueTrust CartoMobile - Config Package","application/vnd.cluetrust.cartomobile-config-pkg"}
#define HTTP_MIMETYPES_RAS            (HTTP_Mimetype){".ras","CMU Image","image/x-cmu-raster"}
#define HTTP_MIMETYPES_DAE            (HTTP_Mimetype){".dae","COLLADA","model/vnd.collada+xml"}
#define HTTP_MIMETYPES_CSV            (HTTP_Mimetype){".csv","Comma-Seperated Values","text/csv"}
#define HTTP_MIMETYPES_CPT            (HTTP_Mimetype){".cpt","Compact Pro","application/mac-compactpro"}
#define HTTP_MIMETYPES_WMLC           (HTTP_Mimetype){".wmlc","Compiled Wireless Markup Language (WMLC)","application/vnd.wap.wmlc"}
#define HTTP_MIMETYPES_CGM            (HTTP_Mimetype){".cgm","Computer Graphics Metafile","image/cgm"}
#define HTTP_MIMETYPES_ICE            (HTTP_Mimetype){".ice","CoolTalk","x-conference/x-cooltalk"}
#define HTTP_MIMETYPES_CMX            (HTTP_Mimetype){".cmx","Corel Metafile Exchange (CMX)","image/x-cmx"}
#define HTTP_MIMETYPES_XAR            (HTTP_Mimetype){".xar","CorelXARA","application/vnd.xara"}
#define HTTP_MIMETYPES_CMC            (HTTP_Mimetype){".cmc","CosmoCaller","application/vnd.cosmocaller"}
#define HTTP_MIMETYPES_CPIO           (HTTP_Mimetype){".cpio","CPIO Archive","application/x-cpio"}
#define HTTP_MIMETYPES_CLKX           (HTTP_Mimetype){".clkx","CrickSoftware - Clicker","application/vnd.crick.clicker"}
#define HTTP_MIMETYPES_CLKK           (HTTP_Mimetype){".clkk","CrickSoftware - Clicker - Keyboard","application/vnd.crick.clicker.keyboard"}
#define HTTP_MIMETYPES_CLKP           (HTTP_Mimetype){".clkp","CrickSoftware - Clicker - Palette","application/vnd.crick.clicker.palette"}
#define HTTP_MIMETYPES_CLKT           (HTTP_Mimetype){".clkt","CrickSoftware - Clicker - Template","application/vnd.crick.clicker.template"}
#define HTTP_MIMETYPES_CLKW           (HTTP_Mimetype){".clkw","CrickSoftware - Clicker - Wordbank","application/vnd.crick.clicker.wordbank"}
#define HTTP_MIMETYPES_WBS            (HTTP_Mimetype){".wbs","Critical Tools - PERT Chart EXPERT","application/vnd.criticaltools.wbs+xml"}
#define HTTP_MIMETYPES_CRYPTONOTE     (HTTP_Mimetype){".cryptonote","CryptoNote","application/vnd.rig.cryptonote"}
#define HTTP_MIMETYPES_CIF            (HTTP_Mimetype){".cif","Crystallographic Interchange Format","chemical/x-cif"}
#define HTTP_MIMETYPES_CMDF           (HTTP_Mimetype){".cmdf","CrystalMaker Data Format","chemical/x-cmdf"}
#define HTTP_MIMETYPES_CU             (HTTP_Mimetype){".cu","CU-SeeMe","application/cu-seeme"}
#define HTTP_MIMETYPES_CWW            (HTTP_Mimetype){".cww","CU-Writer","application/prs.cww"}
#define HTTP_MIMETYPES_CURL           (HTTP_Mimetype){".curl","Curl - Applet","text/vnd.curl"}
#define HTTP_MIMETYPES_DCURL          (HTTP_Mimetype){".dcurl","Curl - Detached Applet","text/vnd.curl.dcurl"}
#define HTTP_MIMETYPES_MCURL          (HTTP_Mimetype){".mcurl","Curl - Manifest File","text/vnd.curl.mcurl"}
#define HTTP_MIMETYPES_SCURL          (HTTP_Mimetype){".scurl","Curl - Source Code","text/vnd.curl.scurl"}
#define HTTP_MIMETYPES_CAR            (HTTP_Mimetype){".car","CURL Applet","application/vnd.curl.car"}
#define HTTP_MIMETYPES_PCURL          (HTTP_Mimetype){".pcurl","CURL Applet","application/vnd.curl.pcurl"}
#define HTTP_MIMETYPES_CMP            (HTTP_Mimetype){".cmp","CustomMenu","application/vnd.yellowriver-custom-menu"}
#define HTTP_MIMETYPES_DSSC           (HTTP_Mimetype){".dssc","Data Structure for the Security Suitability of Cryptographic Algorithms","application/dssc+der"}
#define HTTP_MIMETYPES_XDSSC          (HTTP_Mimetype){".xdssc","Data Structure for the Security Suitability of Cryptographic Algorithms","application/dssc+xml"}
#define HTTP_MIMETYPES_DEB            (HTTP_Mimetype){".deb","Debian Package","application/octet-stream"}
#define HTTP_MIMETYPES_UVA            (HTTP_Mimetype){".uva","DECE Audio","audio/vnd.dece.audio"}
#define HTTP_MIMETYPES_UVI            (HTTP_Mimetype){".uvi","DECE Graphic","image/vnd.dece.graphic"}
#define HTTP_MIMETYPES_UVH            (HTTP_Mimetype){".uvh","DECE High Definition Video","video/vnd.dece.hd"}
#define HTTP_MIMETYPES_UVM            (HTTP_Mimetype){".uvm","DECE Mobile Video","video/vnd.dece.mobile"}
#define HTTP_MIMETYPES_UVU            (HTTP_Mimetype){".uvu","DECE MP4","video/vnd.uvvu.mp4"}
#define HTTP_MIMETYPES_UVP            (HTTP_Mimetype){".uvp","DECE PD Video","video/vnd.dece.pd"}
#define HTTP_MIMETYPES_UVS            (HTTP_Mimetype){".uvs","DECE SD Video","video/vnd.dece.sd"}
#define HTTP_MIMETYPES_UVV            (HTTP_Mimetype){".uvv","DECE Video","video/vnd.dece.video"}
#define HTTP_MIMETYPES_DVI            (HTTP_Mimetype){".dvi","Device Independent File Format (DVI)","application/x-dvi"}
#define HTTP_MIMETYPES_SEED           (HTTP_Mimetype){".seed","Digital Siesmograph Networks - SEED Datafiles","application/vnd.fdsn.seed"}
#define HTTP_MIMETYPES_DTB            (HTTP_Mimetype){".dtb","Digital Talking Book","application/x-dtbook+xml"}
#define HTTP_MIMETYPES_RES            (HTTP_Mimetype){".res","Digital Talking Book - Resource File","application/x-dtbresource+xml"}
#define HTTP_MIMETYPES_AIT            (HTTP_Mimetype){".ait","Digital Video Broadcasting","application/vnd.dvb.ait"}
#define HTTP_MIMETYPES_SVC            (HTTP_Mimetype){".svc","Digital Video Broadcasting","application/vnd.dvb.service"}
#define HTTP_MIMETYPES_EOL            (HTTP_Mimetype){".eol","Digital Winds Music","audio/vnd.digital-winds"}
#define HTTP_MIMETYPES_DJVU           (HTTP_Mimetype){".djvu","DjVu","image/vnd.djvu"}
#define HTTP_MIMETYPES_DTD            (HTTP_Mimetype){".dtd","Document Type Definition","application/xml-dtd"}
#define HTTP_MIMETYPES_MLP            (HTTP_Mimetype){".mlp","Dolby Meridian Lossless Packing","application/vnd.dolby.mlp"}
#define HTTP_MIMETYPES_WAD            (HTTP_Mimetype){".wad","Doom Video Game","application/x-doom"}
#define HTTP_MIMETYPES_DPG            (HTTP_Mimetype){".dpg","DPGraph","application/vnd.dpgraph"}
#define HTTP_MIMETYPES_DRA            (HTTP_Mimetype){".dra","DRA Audio","audio/vnd.dra"}
#define HTTP_MIMETYPES_DFAC           (HTTP_Mimetype){".dfac","DreamFactory","application/vnd.dreamfactory"}
#define HTTP_MIMETYPES_DTS            (HTTP_Mimetype){".dts","DTS Audio","audio/vnd.dts"}
#define HTTP_MIMETYPES_DTSHD          (HTTP_Mimetype){".dtshd","DTS High Definition Audio","audio/vnd.dts.hd"}
#define HTTP_MIMETYPES_DWG            (HTTP_Mimetype){".dwg","DWG Drawing","image/vnd.dwg"}
#define HTTP_MIMETYPES_GEO            (HTTP_Mimetype){".geo","DynaGeo","application/vnd.dynageo"}
#define HTTP_MIMETYPES_ES             (HTTP_Mimetype){".es","ECMAScript","application/ecmascript"}
#define HTTP_MIMETYPES_MAG            (HTTP_Mimetype){".mag","EcoWin Chart","application/vnd.ecowin.chart"}
#define HTTP_MIMETYPES_MMR            (HTTP_Mimetype){".mmr","EDMICS 2000","image/vnd.fujixerox.edmics-mmr"}
#define HTTP_MIMETYPES_RLC            (HTTP_Mimetype){".rlc","EDMICS 2000","image/vnd.fujixerox.edmics-rlc"}
#define HTTP_MIMETYPES_EXI            (HTTP_Mimetype){".exi","Efficient XML Interchange","application/exi"}
#define HTTP_MIMETYPES_MGZ            (HTTP_Mimetype){".mgz","EFI Proteus","application/vnd.proteus.magazine"}
#define HTTP_MIMETYPES_EPUB           (HTTP_Mimetype){".epub","Electronic Publication","application/epub+zip"}
#define HTTP_MIMETYPES_EML            (HTTP_Mimetype){".eml","Email Message","message/rfc822"}
#define HTTP_MIMETYPES_NML            (HTTP_Mimetype){".nml","Enliven Viewer","application/vnd.enliven"}
#define HTTP_MIMETYPES_XPR            (HTTP_Mimetype){".xpr","Express by Infoseek","application/vnd.is-xpr"}
#define HTTP_MIMETYPES_XIF            (HTTP_Mimetype){".xif","eXtended Image File Format (XIFF)","image/vnd.xiff"}
#define HTTP_MIMETYPES_XFDL           (HTTP_Mimetype){".xfdl","Extensible Forms Description Language","application/vnd.xfdl"}
#define HTTP_MIMETYPES_EMMA           (HTTP_Mimetype){".emma","Extensible MultiModal Annotation","application/emma+xml"}
#define HTTP_MIMETYPES_EZ2            (HTTP_Mimetype){".ez2","EZPix Secure Photo Album","application/vnd.ezpix-album"}
#define HTTP_MIMETYPES_EZ3            (HTTP_Mimetype){".ez3","EZPix Secure Photo Album","application/vnd.ezpix-package"}
#define HTTP_MIMETYPES_FST            (HTTP_Mimetype){".fst","FAST Search & Transfer ASA","image/vnd.fst"}
#define HTTP_MIMETYPES_FVT            (HTTP_Mimetype){".fvt","FAST Search & Transfer ASA","video/vnd.fvt"}
#define HTTP_MIMETYPES_FBS            (HTTP_Mimetype){".fbs","FastBid Sheet","image/vnd.fastbidsheet"}
#define HTTP_MIMETYPES_FE_LAUNCH      (HTTP_Mimetype){".fe_launch","FCS Express Layout Link","application/vnd.denovo.fcselayout-link"}
#define HTTP_MIMETYPES_F4V            (HTTP_Mimetype){".f4v","Flash Video","video/x-f4v"}
#define HTTP_MIMETYPES_FLV            (HTTP_Mimetype){".flv","Flash Video","video/x-flv"}
#define HTTP_MIMETYPES_FPX            (HTTP_Mimetype){".fpx","FlashPix","image/vnd.fpx"}
#define HTTP_MIMETYPES_NPX            (HTTP_Mimetype){".npx","FlashPix","image/vnd.net-fpx"}
#define HTTP_MIMETYPES_FLX            (HTTP_Mimetype){".flx","FLEXSTOR","text/vnd.fmi.flexstor"}
#define HTTP_MIMETYPES_FLI            (HTTP_Mimetype){".fli","FLI/FLC Animation Format","video/x-fli"}
#define HTTP_MIMETYPES_FTC            (HTTP_Mimetype){".ftc","FluxTime Clip","application/vnd.fluxtime.clip"}
#define HTTP_MIMETYPES_FDF            (HTTP_Mimetype){".fdf","Forms Data Format","application/vnd.fdf"}
#define HTTP_MIMETYPES_F              (HTTP_Mimetype){".f","Fortran Source File","text/x-fortran"}
#define HTTP_MIMETYPES_MIF            (HTTP_Mimetype){".mif","FrameMaker Interchange Format","application/vnd.mif"}
#define HTTP_MIMETYPES_FM             (HTTP_Mimetype){".fm","FrameMaker Normal Format","application/vnd.framemaker"}
#define HTTP_MIMETYPES_FH             (HTTP_Mimetype){".fh","FreeHand MX","image/x-freehand"}
#define HTTP_MIMETYPES_FSC            (HTTP_Mimetype){".fsc","Friendly Software Corporation","application/vnd.fsc.weblaunch"}
#define HTTP_MIMETYPES_FNC            (HTTP_Mimetype){".fnc","Frogans Player","application/vnd.frogans.fnc"}
#define HTTP_MIMETYPES_LTF            (HTTP_Mimetype){".ltf","Frogans Player","application/vnd.frogans.ltf"}
#define HTTP_MIMETYPES_DDD            (HTTP_Mimetype){".ddd","Fujitsu - Xerox 2D CAD Data","application/vnd.fujixerox.ddd"}
#define HTTP_MIMETYPES_XDW            (HTTP_Mimetype){".xdw","Fujitsu - Xerox DocuWorks","application/vnd.fujixerox.docuworks"}
#define HTTP_MIMETYPES_XBD            (HTTP_Mimetype){".xbd","Fujitsu - Xerox DocuWorks Binder","application/vnd.fujixerox.docuworks.binder"}
#define HTTP_MIMETYPES_OAS            (HTTP_Mimetype){".oas","Fujitsu Oasys","application/vnd.fujitsu.oasys"}
#define HTTP_MIMETYPES_OA2            (HTTP_Mimetype){".oa2","Fujitsu Oasys","application/vnd.fujitsu.oasys2"}
#define HTTP_MIMETYPES_OA3            (HTTP_Mimetype){".oa3","Fujitsu Oasys","application/vnd.fujitsu.oasys3"}
#define HTTP_MIMETYPES_FG5            (HTTP_Mimetype){".fg5","Fujitsu Oasys","application/vnd.fujitsu.oasysgp"}
#define HTTP_MIMETYPES_BH2            (HTTP_Mimetype){".bh2","Fujitsu Oasys","application/vnd.fujitsu.oasysprs"}
#define HTTP_MIMETYPES_SPL            (HTTP_Mimetype){".spl","FutureSplash Animator","application/x-futuresplash"}
#define HTTP_MIMETYPES_FZS            (HTTP_Mimetype){".fzs","FuzzySheet","application/vnd.fuzzysheet"}
#define HTTP_MIMETYPES_G3             (HTTP_Mimetype){".g3","G3 Fax Image","image/g3fax"}
#define HTTP_MIMETYPES_GMX            (HTTP_Mimetype){".gmx","GameMaker ActiveX","application/vnd.gmx"}
#define HTTP_MIMETYPES_GTW            (HTTP_Mimetype){".gtw","Gen-Trix Studio","model/vnd.gtw"}
#define HTTP_MIMETYPES_TXD            (HTTP_Mimetype){".txd","Genomatix Tuxedo Framework","application/vnd.genomatix.tuxedo"}
#define HTTP_MIMETYPES_GGB            (HTTP_Mimetype){".ggb","GeoGebra","application/vnd.geogebra.file"}
#define HTTP_MIMETYPES_GGT            (HTTP_Mimetype){".ggt","GeoGebra","application/vnd.geogebra.tool"}
#define HTTP_MIMETYPES_GDL            (HTTP_Mimetype){".gdl","Geometric Description Language (GDL)","model/vnd.gdl"}
#define HTTP_MIMETYPES_GEX            (HTTP_Mimetype){".gex","GeoMetry Explorer","application/vnd.geometry-explorer"}
#define HTTP_MIMETYPES_GXT            (HTTP_Mimetype){".gxt","GEONExT and JSXGraph","application/vnd.geonext"}
#define HTTP_MIMETYPES_G2W            (HTTP_Mimetype){".g2w","GeoplanW","application/vnd.geoplan"}
#define HTTP_MIMETYPES_G3W            (HTTP_Mimetype){".g3w","GeospacW","application/vnd.geospace"}
#define HTTP_MIMETYPES_GSF            (HTTP_Mimetype){".gsf","Ghostscript Font","application/x-font-ghostscript"}
#define HTTP_MIMETYPES_BDF            (HTTP_Mimetype){".bdf","Glyph Bitmap Distribution Format","application/x-font-bdf"}
#define HTTP_MIMETYPES_GTAR           (HTTP_Mimetype){".gtar","GNU Tar Files","application/x-gtar"}
#define HTTP_MIMETYPES_TEXINFO        (HTTP_Mimetype){".texinfo","GNU Texinfo Document","application/x-texinfo"}
#define HTTP_MIMETYPES_GNUMERIC       (HTTP_Mimetype){".gnumeric","Gnumeric","application/x-gnumeric"}
#define HTTP_MIMETYPES_KML            (HTTP_Mimetype){".kml","Google Earth - KML","application/vnd.google-earth.kml+xml"}
#define HTTP_MIMETYPES_KMZ            (HTTP_Mimetype){".kmz","Google Earth - Zipped KML","application/vnd.google-earth.kmz"}
#define HTTP_MIMETYPES_GPX            (HTTP_Mimetype){".gpx","GPS eXchange Format","application/gpx+xml"}
#define HTTP_MIMETYPES_GQF            (HTTP_Mimetype){".gqf","GrafEq","application/vnd.grafeq"}
#define HTTP_MIMETYPES_GIF            (HTTP_Mimetype){".gif","Graphics Interchange Format","image/gif"}
#define HTTP_MIMETYPES_GV             (HTTP_Mimetype){".gv","Graphviz","text/vnd.graphviz"}
#define HTTP_MIMETYPES_GAC            (HTTP_Mimetype){".gac","Groove - Account","application/vnd.groove-account"}
#define HTTP_MIMETYPES_GHF            (HTTP_Mimetype){".ghf","Groove - Help","application/vnd.groove-help"}
#define HTTP_MIMETYPES_GIM            (HTTP_Mimetype){".gim","Groove - Identity Message","application/vnd.groove-identity-message"}
#define HTTP_MIMETYPES_GRV            (HTTP_Mimetype){".grv","Groove - Injector","application/vnd.groove-injector"}
#define HTTP_MIMETYPES_GTM            (HTTP_Mimetype){".gtm","Groove - Tool Message","application/vnd.groove-tool-message"}
#define HTTP_MIMETYPES_TPL            (HTTP_Mimetype){".tpl","Groove - Tool Template","application/vnd.groove-tool-template"}
#define HTTP_MIMETYPES_VCG            (HTTP_Mimetype){".vcg","Groove - Vcard","application/vnd.groove-vcard"}
#define HTTP_MIMETYPES_H261           (HTTP_Mimetype){".h261","H.261","video/h261"}
#define HTTP_MIMETYPES_H263           (HTTP_Mimetype){".h263","H.263","video/h263"}
#define HTTP_MIMETYPES_H264           (HTTP_Mimetype){".h264","H.264","video/h264"}
#define HTTP_MIMETYPES_HPID           (HTTP_Mimetype){".hpid","Hewlett Packard Instant Delivery","application/vnd.hp-hpid"}
#define HTTP_MIMETYPES_HPS            (HTTP_Mimetype){".hps","Hewlett-Packard's WebPrintSmart","application/vnd.hp-hps"}
#define HTTP_MIMETYPES_HDF            (HTTP_Mimetype){".hdf","Hierarchical Data Format","application/x-hdf"}
#define HTTP_MIMETYPES_RIP            (HTTP_Mimetype){".rip","Hit'n'Mix","audio/vnd.rip"}
#define HTTP_MIMETYPES_HBCI           (HTTP_Mimetype){".hbci","Homebanking Computer Interface (HBCI)","application/vnd.hbci"}
#define HTTP_MIMETYPES_JLT            (HTTP_Mimetype){".jlt","HP Indigo Digital Press - Job Layout Languate","application/vnd.hp-jlyt"}
#define HTTP_MIMETYPES_PCL            (HTTP_Mimetype){".pcl","HP Printer Command Language","application/vnd.hp-pcl"}
#define HTTP_MIMETYPES_HPGL           (HTTP_Mimetype){".hpgl","HP-GL/2 and HP RTL","application/vnd.hp-hpgl"}
#define HTTP_MIMETYPES_HVS            (HTTP_Mimetype){".hvs","HV Script","application/vnd.yamaha.hv-script"}
#define HTTP_MIMETYPES_HVD            (HTTP_Mimetype){".hvd","HV Voice Dictionary","application/vnd.yamaha.hv-dic"}
#define HTTP_MIMETYPES_HVP            (HTTP_Mimetype){".hvp","HV Voice Parameter","application/vnd.yamaha.hv-voice"}
#define HTTP_MIMETYPES_SFD_HDSTX      (HTTP_Mimetype){".sfd-hdstx","Hydrostatix Master Suite","application/vnd.hydrostatix.sof-data"}
#define HTTP_MIMETYPES_STK            (HTTP_Mimetype){".stk","Hyperstudio","application/hyperstudio"}
#define HTTP_MIMETYPES_HAL            (HTTP_Mimetype){".hal","Hypertext Application Language","application/vnd.hal+xml"}
#define HTTP_MIMETYPES_HTML           (HTTP_Mimetype){".html","HyperText Markup Language (HTML)","text/html"}
#define HTTP_MIMETYPES_IRM            (HTTP_Mimetype){".irm","IBM DB2 Rights Manager","application/vnd.ibm.rights-management"}
#define HTTP_MIMETYPES_SC             (HTTP_Mimetype){".sc","IBM Electronic Media Management System - Secure Container","application/vnd.ibm.secure-container"}
#define HTTP_MIMETYPES_ICS            (HTTP_Mimetype){".ics","iCalendar","text/calendar"}
#define HTTP_MIMETYPES_ICC            (HTTP_Mimetype){".icc","ICC profile","application/vnd.iccprofile"}
#define HTTP_MIMETYPES_ICO            (HTTP_Mimetype){".ico","Icon Image","image/vnd.microsoft.icon"}
#define HTTP_MIMETYPES_IGL            (HTTP_Mimetype){".igl","igLoader","application/vnd.igloader"}
#define HTTP_MIMETYPES_IEF            (HTTP_Mimetype){".ief","Image Exchange Format","image/ief"}
#define HTTP_MIMETYPES_IVP            (HTTP_Mimetype){".ivp","ImmerVision PURE Players","application/vnd.immervision-ivp"}
#define HTTP_MIMETYPES_IVU            (HTTP_Mimetype){".ivu","ImmerVision PURE Players","application/vnd.immervision-ivu"}
#define HTTP_MIMETYPES_RIF            (HTTP_Mimetype){".rif","IMS Networks","application/reginfo+xml"}
#define HTTP_MIMETYPES_3DML           (HTTP_Mimetype){".3dml","In3D - 3DML","text/vnd.in3d.3dml"}
#define HTTP_MIMETYPES_SPOT           (HTTP_Mimetype){".spot","In3D - 3DML","text/vnd.in3d.spot"}
#define HTTP_MIMETYPES_IGS            (HTTP_Mimetype){".igs","Initial Graphics Exchange Specification (IGES)","model/iges"}
#define HTTP_MIMETYPES_I2G            (HTTP_Mimetype){".i2g","Interactive Geometry Software","application/vnd.intergeo"}
#define HTTP_MIMETYPES_CDY            (HTTP_Mimetype){".cdy","Interactive Geometry Software Cinderella","application/vnd.cinderella"}
#define HTTP_MIMETYPES_XPW            (HTTP_Mimetype){".xpw","Intercon FormNet","application/vnd.intercon.formnet"}
#define HTTP_MIMETYPES_FCS            (HTTP_Mimetype){".fcs","International Society for Advancement of Cytometry","application/vnd.isac.fcs"}
#define HTTP_MIMETYPES_IPFIX          (HTTP_Mimetype){".ipfix","Internet Protocol Flow Information Export","application/ipfix"}
#define HTTP_MIMETYPES_CER            (HTTP_Mimetype){".cer","Internet Public Key Infrastructure - Certificate","application/pkix-cert"}
#define HTTP_MIMETYPES_PKI            (HTTP_Mimetype){".pki","Internet Public Key Infrastructure - Certificate Management Protocole","application/pkixcmp"}
#define HTTP_MIMETYPES_CRL            (HTTP_Mimetype){".crl","Internet Public Key Infrastructure - Certificate Revocation Lists","application/pkix-crl"}
#define HTTP_MIMETYPES_PKIPATH        (HTTP_Mimetype){".pkipath","Internet Public Key Infrastructure - Certification Path","application/pkix-pkipath"}
#define HTTP_MIMETYPES_IGM            (HTTP_Mimetype){".igm","IOCOM Visimeet","application/vnd.insors.igm"}
#define HTTP_MIMETYPES_RCPROFILE      (HTTP_Mimetype){".rcprofile","IP Unplugged Roaming Client","application/vnd.ipunplugged.rcprofile"}
#define HTTP_MIMETYPES_IRP            (HTTP_Mimetype){".irp","iRepository / Lucidoc Editor","application/vnd.irepository.package+xml"}
#define HTTP_MIMETYPES_JAD            (HTTP_Mimetype){".jad","J2ME App Descriptor","text/vnd.sun.j2me.app-descriptor"}
#define HTTP_MIMETYPES_JAR            (HTTP_Mimetype){".jar","Java Archive","application/java-archive"}
#define HTTP_MIMETYPES_CLASS          (HTTP_Mimetype){".class","Java Bytecode File","application/java-vm"}
#define HTTP_MIMETYPES_JNLP           (HTTP_Mimetype){".jnlp","Java Network Launching Protocol","application/x-java-jnlp-file"}
#define HTTP_MIMETYPES_SER            (HTTP_Mimetype){".ser","Java Serialized Object","application/java-serialized-object"}
#define HTTP_MIMETYPES_AVA            (HTTP_Mimetype){"java","Java Source File","text/x-java-source"}
#define HTTP_MIMETYPES_JS             (HTTP_Mimetype){".js","JavaScript","application/javascript"}
#define HTTP_MIMETYPES_JSON           (HTTP_Mimetype){".json","JavaScript Object Notation (JSON)","application/json"}
#define HTTP_MIMETYPES_JODA           (HTTP_Mimetype){".joda","Joda Archive","application/vnd.joost.joda-archive"}
#define HTTP_MIMETYPES_JPM            (HTTP_Mimetype){".jpm","JPEG 2000 Compound Image File Format","image/jpm"}
#define HTTP_MIMETYPES_JPEG           (HTTP_Mimetype){".jpeg","JPEG Image","image/jpeg"}
#define HTTP_MIMETYPES_JPG            (HTTP_Mimetype){".jpg","JPEG Image","image/jpeg"}
#define HTTP_MIMETYPES_PJPEG          (HTTP_Mimetype){".pjpeg","JPEG Image (Progressive)","image/pjpeg"}
#define HTTP_MIMETYPES_JPGV           (HTTP_Mimetype){".jpgv","JPGVideo","video/jpeg"}
#define HTTP_MIMETYPES_KTZ            (HTTP_Mimetype){".ktz","Kahootz","application/vnd.kahootz"}
#define HTTP_MIMETYPES_MMD            (HTTP_Mimetype){".mmd","Karaoke on Chipnuts Chipsets","application/vnd.chipnuts.karaoke-mmd"}
#define HTTP_MIMETYPES_KARBON         (HTTP_Mimetype){".karbon","KDE KOffice Office Suite - Karbon","application/vnd.kde.karbon"}
#define HTTP_MIMETYPES_CHRT           (HTTP_Mimetype){".chrt","KDE KOffice Office Suite - KChart","application/vnd.kde.kchart"}
#define HTTP_MIMETYPES_KFO            (HTTP_Mimetype){".kfo","KDE KOffice Office Suite - Kformula","application/vnd.kde.kformula"}
#define HTTP_MIMETYPES_FLW            (HTTP_Mimetype){".flw","KDE KOffice Office Suite - Kivio","application/vnd.kde.kivio"}
#define HTTP_MIMETYPES_KON            (HTTP_Mimetype){".kon","KDE KOffice Office Suite - Kontour","application/vnd.kde.kontour"}
#define HTTP_MIMETYPES_KPR            (HTTP_Mimetype){".kpr","KDE KOffice Office Suite - Kpresenter","application/vnd.kde.kpresenter"}
#define HTTP_MIMETYPES_KSP            (HTTP_Mimetype){".ksp","KDE KOffice Office Suite - Kspread","application/vnd.kde.kspread"}
#define HTTP_MIMETYPES_KWD            (HTTP_Mimetype){".kwd","KDE KOffice Office Suite - Kword","application/vnd.kde.kword"}
#define HTTP_MIMETYPES_HTKE           (HTTP_Mimetype){".htke","Kenamea App","application/vnd.kenameaapp"}
#define HTTP_MIMETYPES_KIA            (HTTP_Mimetype){".kia","Kidspiration","application/vnd.kidspiration"}
#define HTTP_MIMETYPES_KNE            (HTTP_Mimetype){".kne","Kinar Applications","application/vnd.kinar"}
#define HTTP_MIMETYPES_SSE            (HTTP_Mimetype){".sse","Kodak Storyshare","application/vnd.kodak-descriptor"}
#define HTTP_MIMETYPES_LASXML         (HTTP_Mimetype){".lasxml","Laser App Enterprise","application/vnd.las.las+xml"}
#define HTTP_MIMETYPES_LATEX          (HTTP_Mimetype){".latex","LaTeX","application/x-latex"}
#define HTTP_MIMETYPES_LBD            (HTTP_Mimetype){".lbd","Life Balance - Desktop Edition","application/vnd.llamagraphics.life-balance.desktop"}
#define HTTP_MIMETYPES_LBE            (HTTP_Mimetype){".lbe","Life Balance - Exchange Format","application/vnd.llamagraphics.life-balance.exchange+xml"}
#define HTTP_MIMETYPES_JAM            (HTTP_Mimetype){".jam","Lightspeed Audio Lab","application/vnd.jam"}
#define HTTP_MIMETYPES_123            (HTTP_Mimetype){".123","Lotus 1-2-3","application/vnd.lotus-1-2-3"}
#define HTTP_MIMETYPES_APR            (HTTP_Mimetype){".apr","Lotus Approach","application/vnd.lotus-approach"}
#define HTTP_MIMETYPES_PRE            (HTTP_Mimetype){".pre","Lotus Freelance","application/vnd.lotus-freelance"}
#define HTTP_MIMETYPES_NSF            (HTTP_Mimetype){".nsf","Lotus Notes","application/vnd.lotus-notes"}
#define HTTP_MIMETYPES_ORG            (HTTP_Mimetype){".org","Lotus Organizer","application/vnd.lotus-organizer"}
#define HTTP_MIMETYPES_SCM            (HTTP_Mimetype){".scm","Lotus Screencam","application/vnd.lotus-screencam"}
#define HTTP_MIMETYPES_LWP            (HTTP_Mimetype){".lwp","Lotus Wordpro","application/vnd.lotus-wordpro"}
#define HTTP_MIMETYPES_LVP            (HTTP_Mimetype){".lvp","Lucent Voice","audio/vnd.lucent.voice"}
#define HTTP_MIMETYPES_M3U            (HTTP_Mimetype){".m3u","M3U (Multimedia Playlist)","audio/x-mpegurl"}
#define HTTP_MIMETYPES_M4V            (HTTP_Mimetype){".m4v","M4v","video/x-m4v"}
#define HTTP_MIMETYPES_HQX            (HTTP_Mimetype){".hqx","Macintosh BinHex 4.0","application/mac-binhex40"}
#define HTTP_MIMETYPES_PORTPKG        (HTTP_Mimetype){".portpkg","MacPorts Port System","application/vnd.macports.portpkg"}
#define HTTP_MIMETYPES_MGP            (HTTP_Mimetype){".mgp","MapGuide DBXML","application/vnd.osgeo.mapguide.package"}
#define HTTP_MIMETYPES_MRC            (HTTP_Mimetype){".mrc","MARC Formats","application/marc"}
#define HTTP_MIMETYPES_MRCX           (HTTP_Mimetype){".mrcx","MARC21 XML Schema","application/marcxml+xml"}
#define HTTP_MIMETYPES_MXF            (HTTP_Mimetype){".mxf","Material Exchange Format","application/mxf"}
#define HTTP_MIMETYPES_NBP            (HTTP_Mimetype){".nbp","Mathematica Notebook Player","application/vnd.wolfram.player"}
#define HTTP_MIMETYPES_MA             (HTTP_Mimetype){".ma","Mathematica Notebooks","application/mathematica"}
#define HTTP_MIMETYPES_MATHML         (HTTP_Mimetype){".mathml","Mathematical Markup Language","application/mathml+xml"}
#define HTTP_MIMETYPES_MBOX           (HTTP_Mimetype){".mbox","Mbox database files","application/mbox"}
#define HTTP_MIMETYPES_MC1            (HTTP_Mimetype){".mc1","MedCalc","application/vnd.medcalcdata"}
#define HTTP_MIMETYPES_MSCML          (HTTP_Mimetype){".mscml","Media Server Control Markup Language","application/mediaservercontrol+xml"}
#define HTTP_MIMETYPES_CDKEY          (HTTP_Mimetype){".cdkey","MediaRemote","application/vnd.mediastation.cdkey"}
#define HTTP_MIMETYPES_MWF            (HTTP_Mimetype){".mwf","Medical Waveform Encoding Format","application/vnd.mfer"}
#define HTTP_MIMETYPES_MFM            (HTTP_Mimetype){".mfm","Melody Format for Mobile Platform","application/vnd.mfmp"}
#define HTTP_MIMETYPES_MSH            (HTTP_Mimetype){".msh","Mesh Data Type","model/mesh"}
#define HTTP_MIMETYPES_MADS           (HTTP_Mimetype){".mads","Metadata Authority Description Schema","application/mads+xml"}
#define HTTP_MIMETYPES_METS           (HTTP_Mimetype){".mets","Metadata Encoding and Transmission Standard","application/mets+xml"}
#define HTTP_MIMETYPES_MODS           (HTTP_Mimetype){".mods","Metadata Object Description Schema","application/mods+xml"}
#define HTTP_MIMETYPES_META4          (HTTP_Mimetype){".meta4","Metalink","application/metalink4+xml"}
#define HTTP_MIMETYPES_MCD            (HTTP_Mimetype){".mcd","Micro CADAM Helix D&D","application/vnd.mcd"}
#define HTTP_MIMETYPES_FLO            (HTTP_Mimetype){".flo","Micrografx","application/vnd.micrografx.flo"}
#define HTTP_MIMETYPES_IGX            (HTTP_Mimetype){".igx","Micrografx iGrafx Professional","application/vnd.micrografx.igx"}
#define HTTP_MIMETYPES_ES3            (HTTP_Mimetype){".es3","MICROSEC e-Szignï¿½","application/vnd.eszigno3+xml"}
#define HTTP_MIMETYPES_MDB            (HTTP_Mimetype){".mdb","Microsoft Access","application/x-msaccess"}
#define HTTP_MIMETYPES_ASF            (HTTP_Mimetype){".asf","Microsoft Advanced Systems Format (ASF)","video/x-ms-asf"}
#define HTTP_MIMETYPES_EXE            (HTTP_Mimetype){".exe","Microsoft Application","application/octet-stream"}
#define HTTP_MIMETYPES_CIL            (HTTP_Mimetype){".cil","Microsoft Artgalry","application/vnd.ms-artgalry"}
#define HTTP_MIMETYPES_CAB            (HTTP_Mimetype){".cab","Microsoft Cabinet File","application/vnd.ms-cab-compressed"}
#define HTTP_MIMETYPES_IMS            (HTTP_Mimetype){".ims","Microsoft Class Server","application/vnd.ms-ims"}
#define HTTP_MIMETYPES_APPLICATION    (HTTP_Mimetype){".application","Microsoft ClickOnce","application/x-ms-application"}
#define HTTP_MIMETYPES_CLP            (HTTP_Mimetype){".clp","Microsoft Clipboard Clip","application/x-msclip"}
#define HTTP_MIMETYPES_MDI            (HTTP_Mimetype){".mdi","Microsoft Document Imaging Format","image/vnd.ms-modi"}
#define HTTP_MIMETYPES_EOT            (HTTP_Mimetype){".eot","Microsoft Embedded OpenType","application/vnd.ms-fontobject"}
#define HTTP_MIMETYPES_XLS            (HTTP_Mimetype){".xls","Microsoft Excel","application/vnd.ms-excel"}
#define HTTP_MIMETYPES_XLAM           (HTTP_Mimetype){".xlam","Microsoft Excel - Add-In File","application/vnd.ms-excel.addin.macroenabled.12"}
#define HTTP_MIMETYPES_XLSB           (HTTP_Mimetype){".xlsb","Microsoft Excel - Binary Workbook","application/vnd.ms-excel.sheet.binary.macroenabled.12"}
#define HTTP_MIMETYPES_XLTM           (HTTP_Mimetype){".xltm","Microsoft Excel - Macro-Enabled Template File","application/vnd.ms-excel.template.macroenabled.12"}
#define HTTP_MIMETYPES_XLSM           (HTTP_Mimetype){".xlsm","Microsoft Excel - Macro-Enabled Workbook","application/vnd.ms-excel.sheet.macroenabled.12"}
#define HTTP_MIMETYPES_CHM            (HTTP_Mimetype){".chm","Microsoft Html Help File","application/vnd.ms-htmlhelp"}
#define HTTP_MIMETYPES_CRD            (HTTP_Mimetype){".crd","Microsoft Information Card","application/x-mscardfile"}
#define HTTP_MIMETYPES_LRM            (HTTP_Mimetype){".lrm","Microsoft Learning Resource Module","application/vnd.ms-lrm"}
#define HTTP_MIMETYPES_MVB            (HTTP_Mimetype){".mvb","Microsoft MediaView","application/x-msmediaview"}
#define HTTP_MIMETYPES_MNY            (HTTP_Mimetype){".mny","Microsoft Money","application/x-msmoney"}
#define HTTP_MIMETYPES_PPTX           (HTTP_Mimetype){".pptx","Microsoft Office - OOXML - Presentation","application/vnd.openxmlformats-officedocument.presentationml.presentation"}
#define HTTP_MIMETYPES_SLDX           (HTTP_Mimetype){".sldx","Microsoft Office - OOXML - Presentation (Slide)","application/vnd.openxmlformats-officedocument.presentationml.slide"}
#define HTTP_MIMETYPES_PPSX           (HTTP_Mimetype){".ppsx","Microsoft Office - OOXML - Presentation (Slideshow)","application/vnd.openxmlformats-officedocument.presentationml.slideshow"}
#define HTTP_MIMETYPES_POTX           (HTTP_Mimetype){".potx","Microsoft Office - OOXML - Presentation Template","application/vnd.openxmlformats-officedocument.presentationml.template"}
#define HTTP_MIMETYPES_XLSX           (HTTP_Mimetype){".xlsx","Microsoft Office - OOXML - Spreadsheet","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
#define HTTP_MIMETYPES_XLTX           (HTTP_Mimetype){".xltx","Microsoft Office - OOXML - Spreadsheet Template","application/vnd.openxmlformats-officedocument.spreadsheetml.template"}
#define HTTP_MIMETYPES_DOCX           (HTTP_Mimetype){".docx","Microsoft Office - OOXML - Word Document","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
#define HTTP_MIMETYPES_DOTX           (HTTP_Mimetype){".dotx","Microsoft Office - OOXML - Word Document Template","application/vnd.openxmlformats-officedocument.wordprocessingml.template"}
#define HTTP_MIMETYPES_OBD            (HTTP_Mimetype){".obd","Microsoft Office Binder","application/x-msbinder"}
#define HTTP_MIMETYPES_THMX           (HTTP_Mimetype){".thmx","Microsoft Office System Release Theme","application/vnd.ms-officetheme"}
#define HTTP_MIMETYPES_ONETOC         (HTTP_Mimetype){".onetoc","Microsoft OneNote","application/onenote"}
#define HTTP_MIMETYPES_PYA            (HTTP_Mimetype){".pya","Microsoft PlayReady Ecosystem","audio/vnd.ms-playready.media.pya"}
#define HTTP_MIMETYPES_PYV            (HTTP_Mimetype){".pyv","Microsoft PlayReady Ecosystem Video","video/vnd.ms-playready.media.pyv"}
#define HTTP_MIMETYPES_PPT            (HTTP_Mimetype){".ppt","Microsoft PowerPoint","application/vnd.ms-powerpoint"}
#define HTTP_MIMETYPES_PPAM           (HTTP_Mimetype){".ppam","Microsoft PowerPoint - Add-in file","application/vnd.ms-powerpoint.addin.macroenabled.12"}
#define HTTP_MIMETYPES_SLDM           (HTTP_Mimetype){".sldm","Microsoft PowerPoint - Macro-Enabled Open XML Slide","application/vnd.ms-powerpoint.slide.macroenabled.12"}
#define HTTP_MIMETYPES_PPTM           (HTTP_Mimetype){".pptm","Microsoft PowerPoint - Macro-Enabled Presentation File","application/vnd.ms-powerpoint.presentation.macroenabled.12"}
#define HTTP_MIMETYPES_PPSM           (HTTP_Mimetype){".ppsm","Microsoft PowerPoint - Macro-Enabled Slide Show File","application/vnd.ms-powerpoint.slideshow.macroenabled.12"}
#define HTTP_MIMETYPES_POTM           (HTTP_Mimetype){".potm","Microsoft PowerPoint - Macro-Enabled Template File","application/vnd.ms-powerpoint.template.macroenabled.12"}
#define HTTP_MIMETYPES_MPP            (HTTP_Mimetype){".mpp","Microsoft Project","application/vnd.ms-project"}
#define HTTP_MIMETYPES_PUB            (HTTP_Mimetype){".pub","Microsoft Publisher","application/x-mspublisher"}
#define HTTP_MIMETYPES_SCD            (HTTP_Mimetype){".scd","Microsoft Schedule+","application/x-msschedule"}
#define HTTP_MIMETYPES_XAP            (HTTP_Mimetype){".xap","Microsoft Silverlight","application/x-silverlight-app"}
#define HTTP_MIMETYPES_STL            (HTTP_Mimetype){".stl","Microsoft Trust UI Provider - Certificate Trust Link","application/vnd.ms-pki.stl"}
#define HTTP_MIMETYPES_CAT            (HTTP_Mimetype){".cat","Microsoft Trust UI Provider - Security Catalog","application/vnd.ms-pki.seccat"}
#define HTTP_MIMETYPES_VSD            (HTTP_Mimetype){".vsd","Microsoft Visio","application/vnd.visio"}
#define HTTP_MIMETYPES_VSDX           (HTTP_Mimetype){".vsdx","Microsoft Visio 2013","application/vnd.visio2013"}
#define HTTP_MIMETYPES_WM             (HTTP_Mimetype){".wm","Microsoft Windows Media","video/x-ms-wm"}
#define HTTP_MIMETYPES_WMA            (HTTP_Mimetype){".wma","Microsoft Windows Media Audio","audio/x-ms-wma"}
#define HTTP_MIMETYPES_WAX            (HTTP_Mimetype){".wax","Microsoft Windows Media Audio Redirector","audio/x-ms-wax"}
#define HTTP_MIMETYPES_WMX            (HTTP_Mimetype){".wmx","Microsoft Windows Media Audio/Video Playlist","video/x-ms-wmx"}
#define HTTP_MIMETYPES_WMD            (HTTP_Mimetype){".wmd","Microsoft Windows Media Player Download Package","application/x-ms-wmd"}
#define HTTP_MIMETYPES_WPL            (HTTP_Mimetype){".wpl","Microsoft Windows Media Player Playlist","application/vnd.ms-wpl"}
#define HTTP_MIMETYPES_WMZ            (HTTP_Mimetype){".wmz","Microsoft Windows Media Player Skin Package","application/x-ms-wmz"}
#define HTTP_MIMETYPES_WMV            (HTTP_Mimetype){".wmv","Microsoft Windows Media Video","video/x-ms-wmv"}
#define HTTP_MIMETYPES_WVX            (HTTP_Mimetype){".wvx","Microsoft Windows Media Video Playlist","video/x-ms-wvx"}
#define HTTP_MIMETYPES_WMF            (HTTP_Mimetype){".wmf","Microsoft Windows Metafile","image/wmf"}
#define HTTP_MIMETYPES_TRM            (HTTP_Mimetype){".trm","Microsoft Windows Terminal Services","application/x-msterminal"}
#define HTTP_MIMETYPES_DOC            (HTTP_Mimetype){".doc","Microsoft Word","application/msword"}
#define HTTP_MIMETYPES_DOCM           (HTTP_Mimetype){".docm","Microsoft Word - Macro-Enabled Document","application/vnd.ms-word.document.macroenabled.12"}
#define HTTP_MIMETYPES_DOTM           (HTTP_Mimetype){".dotm","Microsoft Word - Macro-Enabled Template","application/vnd.ms-word.template.macroenabled.12"}
#define HTTP_MIMETYPES_WRI            (HTTP_Mimetype){".wri","Microsoft Wordpad","application/x-mswrite"}
#define HTTP_MIMETYPES_WPS            (HTTP_Mimetype){".wps","Microsoft Works","application/vnd.ms-works"}
#define HTTP_MIMETYPES_XBAP           (HTTP_Mimetype){".xbap","Microsoft XAML Browser Application","application/x-ms-xbap"}
#define HTTP_MIMETYPES_XPS            (HTTP_Mimetype){".xps","Microsoft XML Paper Specification","application/vnd.ms-xpsdocument"}
#define HTTP_MIMETYPES_MID            (HTTP_Mimetype){".mid","MIDI - Musical Instrument Digital Interface","audio/midi"}
#define HTTP_MIMETYPES_MPY            (HTTP_Mimetype){".mpy","MiniPay","application/vnd.ibm.minipay"}
#define HTTP_MIMETYPES_AFP            (HTTP_Mimetype){".afp","MO:DCA-P","application/vnd.ibm.modcap"}
#define HTTP_MIMETYPES_RMS            (HTTP_Mimetype){".rms","Mobile Information Device Profile","application/vnd.jcp.javame.midlet-rms"}
#define HTTP_MIMETYPES_TMO            (HTTP_Mimetype){".tmo","MobileTV","application/vnd.tmobile-livetv"}
#define HTTP_MIMETYPES_PRC            (HTTP_Mimetype){".prc","Mobipocket","application/x-mobipocket-ebook"}
#define HTTP_MIMETYPES_MBK            (HTTP_Mimetype){".mbk","Mobius Management Systems - Basket file","application/vnd.mobius.mbk"}
#define HTTP_MIMETYPES_DIS            (HTTP_Mimetype){".dis","Mobius Management Systems - Distribution Database","application/vnd.mobius.dis"}
#define HTTP_MIMETYPES_PLC            (HTTP_Mimetype){".plc","Mobius Management Systems - Policy Definition Language File","application/vnd.mobius.plc"}
#define HTTP_MIMETYPES_MQY            (HTTP_Mimetype){".mqy","Mobius Management Systems - Query File","application/vnd.mobius.mqy"}
#define HTTP_MIMETYPES_MSL            (HTTP_Mimetype){".msl","Mobius Management Systems - Script Language","application/vnd.mobius.msl"}
#define HTTP_MIMETYPES_TXF            (HTTP_Mimetype){".txf","Mobius Management Systems - Topic Index File","application/vnd.mobius.txf"}
#define HTTP_MIMETYPES_DAF            (HTTP_Mimetype){".daf","Mobius Management Systems - UniversalArchive","application/vnd.mobius.daf"}
#define HTTP_MIMETYPES_FLY            (HTTP_Mimetype){".fly","mod_fly / fly.cgi","text/vnd.fly"}
#define HTTP_MIMETYPES_MPC            (HTTP_Mimetype){".mpc","Mophun Certificate","application/vnd.mophun.certificate"}
#define HTTP_MIMETYPES_MPN            (HTTP_Mimetype){".mpn","Mophun VM","application/vnd.mophun.application"}
#define HTTP_MIMETYPES_MJ2            (HTTP_Mimetype){".mj2","Motion JPEG 2000","video/mj2"}
#define HTTP_MIMETYPES_MPGA           (HTTP_Mimetype){".mpga","MPEG Audio","audio/mpeg"}
#define HTTP_MIMETYPES_MXU            (HTTP_Mimetype){".mxu","MPEG Url","video/vnd.mpegurl"}
#define HTTP_MIMETYPES_MPEG           (HTTP_Mimetype){".mpeg","MPEG Video","video/mpeg"}
#define HTTP_MIMETYPES_M21            (HTTP_Mimetype){".m21","MPEG-21","application/mp21"}
#define HTTP_MIMETYPES_MP4A           (HTTP_Mimetype){".mp4a","MPEG-4 Audio","audio/mp4"}
#define HTTP_MIMETYPES_MP3            (HTTP_Mimetype){".mp3","MPEG3","audio/mpeg"}
#define HTTP_MIMETYPES_MP4            (HTTP_Mimetype){".mp4","MPEG-4 Video","video/mp4"}
#define HTTP_MIMETYPES_M3U8           (HTTP_Mimetype){".m3u8","Multimedia Playlist Unicode","application/vnd.apple.mpegurl"}
#define HTTP_MIMETYPES_MUS            (HTTP_Mimetype){".mus","MUsical Score Interpreted Code Invented for the ASCII designation of Notation","application/vnd.musician"}
#define HTTP_MIMETYPES_MSTY           (HTTP_Mimetype){".msty","Muvee Automatic Video Editing","application/vnd.muvee.style"}
#define HTTP_MIMETYPES_MXML           (HTTP_Mimetype){".mxml","MXML","application/xv+xml"}
#define HTTP_MIMETYPES_NGDAT          (HTTP_Mimetype){".ngdat","N-Gage Game Data","application/vnd.nokia.n-gage.data"}
#define HTTP_MIMETYPES_N_GAGE         (HTTP_Mimetype){".n-gage","N-Gage Game Installer","application/vnd.nokia.n-gage.symbian.install"}
#define HTTP_MIMETYPES_NCX            (HTTP_Mimetype){".ncx","Navigation Control file for XML (for ePub)","application/x-dtbncx+xml"}
#define HTTP_MIMETYPES_NC             (HTTP_Mimetype){".nc","Network Common Data Form (NetCDF)","application/x-netcdf"}
#define HTTP_MIMETYPES_NLU            (HTTP_Mimetype){".nlu","neuroLanguage","application/vnd.neurolanguage.nlu"}
#define HTTP_MIMETYPES_DNA            (HTTP_Mimetype){".dna","New Moon Liftoff/DNA","application/vnd.dna"}
#define HTTP_MIMETYPES_NND            (HTTP_Mimetype){".nnd","NobleNet Directory","application/vnd.noblenet-directory"}
#define HTTP_MIMETYPES_NNS            (HTTP_Mimetype){".nns","NobleNet Sealer","application/vnd.noblenet-sealer"}
#define HTTP_MIMETYPES_NNW            (HTTP_Mimetype){".nnw","NobleNet Web","application/vnd.noblenet-web"}
#define HTTP_MIMETYPES_RPST           (HTTP_Mimetype){".rpst","Nokia Radio Application - Preset","application/vnd.nokia.radio-preset"}
#define HTTP_MIMETYPES_RPSS           (HTTP_Mimetype){".rpss","Nokia Radio Application - Preset","application/vnd.nokia.radio-presets"}
#define HTTP_MIMETYPES_N3             (HTTP_Mimetype){".n3","Notation3","text/n3"}
#define HTTP_MIMETYPES_EDM            (HTTP_Mimetype){".edm","Novadigm's RADIA and EDM products","application/vnd.novadigm.edm"}
#define HTTP_MIMETYPES_EDX            (HTTP_Mimetype){".edx","Novadigm's RADIA and EDM products","application/vnd.novadigm.edx"}
#define HTTP_MIMETYPES_EXT            (HTTP_Mimetype){".ext","Novadigm's RADIA and EDM products","application/vnd.novadigm.ext"}
#define HTTP_MIMETYPES_GPH            (HTTP_Mimetype){".gph","NpGraphIt","application/vnd.flographit"}
#define HTTP_MIMETYPES_ECELP4800      (HTTP_Mimetype){".ecelp4800","Nuera ECELP 4800","audio/vnd.nuera.ecelp4800"}
#define HTTP_MIMETYPES_ECELP7470      (HTTP_Mimetype){".ecelp7470","Nuera ECELP 7470","audio/vnd.nuera.ecelp7470"}
#define HTTP_MIMETYPES_ECELP9600      (HTTP_Mimetype){".ecelp9600","Nuera ECELP 9600","audio/vnd.nuera.ecelp9600"}
#define HTTP_MIMETYPES_ODA            (HTTP_Mimetype){".oda","Office Document Architecture","application/oda"}
#define HTTP_MIMETYPES_OGX            (HTTP_Mimetype){".ogx","Ogg","application/ogg"}
#define HTTP_MIMETYPES_OGA            (HTTP_Mimetype){".oga","Ogg Audio","audio/ogg"}
#define HTTP_MIMETYPES_OGV            (HTTP_Mimetype){".ogv","Ogg Video","video/ogg"}
#define HTTP_MIMETYPES_DD2            (HTTP_Mimetype){".dd2","OMA Download Agents","application/vnd.oma.dd2+xml"}
#define HTTP_MIMETYPES_OTH            (HTTP_Mimetype){".oth","Open Document Text Web","application/vnd.oasis.opendocument.text-web"}
#define HTTP_MIMETYPES_OPF            (HTTP_Mimetype){".opf","Open eBook Publication Structure","application/oebps-package+xml"}
#define HTTP_MIMETYPES_QBO            (HTTP_Mimetype){".qbo","Open Financial Exchange","application/vnd.intu.qbo"}
#define HTTP_MIMETYPES_OXT            (HTTP_Mimetype){".oxt","Open Office Extension","application/vnd.openofficeorg.extension"}
#define HTTP_MIMETYPES_OSF            (HTTP_Mimetype){".osf","Open Score Format","application/vnd.yamaha.openscoreformat"}
#define HTTP_MIMETYPES_WEBA           (HTTP_Mimetype){".weba","Open Web Media Project - Audio","audio/webm"}
#define HTTP_MIMETYPES_WEBM           (HTTP_Mimetype){".webm","Open Web Media Project - Video","video/webm"}
#define HTTP_MIMETYPES_ODC            (HTTP_Mimetype){".odc","OpenDocument Chart","application/vnd.oasis.opendocument.chart"}
#define HTTP_MIMETYPES_OTC            (HTTP_Mimetype){".otc","OpenDocument Chart Template","application/vnd.oasis.opendocument.chart-template"}
#define HTTP_MIMETYPES_ODB            (HTTP_Mimetype){".odb","OpenDocument Database","application/vnd.oasis.opendocument.database"}
#define HTTP_MIMETYPES_ODF            (HTTP_Mimetype){".odf","OpenDocument Formula","application/vnd.oasis.opendocument.formula"}
#define HTTP_MIMETYPES_ODFT           (HTTP_Mimetype){".odft","OpenDocument Formula Template","application/vnd.oasis.opendocument.formula-template"}
#define HTTP_MIMETYPES_ODG            (HTTP_Mimetype){".odg","OpenDocument Graphics","application/vnd.oasis.opendocument.graphics"}
#define HTTP_MIMETYPES_OTG            (HTTP_Mimetype){".otg","OpenDocument Graphics Template","application/vnd.oasis.opendocument.graphics-template"}
#define HTTP_MIMETYPES_ODI            (HTTP_Mimetype){".odi","OpenDocument Image","application/vnd.oasis.opendocument.image"}
#define HTTP_MIMETYPES_OTI            (HTTP_Mimetype){".oti","OpenDocument Image Template","application/vnd.oasis.opendocument.image-template"}
#define HTTP_MIMETYPES_ODP            (HTTP_Mimetype){".odp","OpenDocument Presentation","application/vnd.oasis.opendocument.presentation"}
#define HTTP_MIMETYPES_OTP            (HTTP_Mimetype){".otp","OpenDocument Presentation Template","application/vnd.oasis.opendocument.presentation-template"}
#define HTTP_MIMETYPES_ODS            (HTTP_Mimetype){".ods","OpenDocument Spreadsheet","application/vnd.oasis.opendocument.spreadsheet"}
#define HTTP_MIMETYPES_OTS            (HTTP_Mimetype){".ots","OpenDocument Spreadsheet Template","application/vnd.oasis.opendocument.spreadsheet-template"}
#define HTTP_MIMETYPES_ODT            (HTTP_Mimetype){".odt","OpenDocument Text","application/vnd.oasis.opendocument.text"}
#define HTTP_MIMETYPES_ODM            (HTTP_Mimetype){".odm","OpenDocument Text Master","application/vnd.oasis.opendocument.text-master"}
#define HTTP_MIMETYPES_OTT            (HTTP_Mimetype){".ott","OpenDocument Text Template","application/vnd.oasis.opendocument.text-template"}
#define HTTP_MIMETYPES_KTX            (HTTP_Mimetype){".ktx","OpenGL Textures (KTX)","image/ktx"}
#define HTTP_MIMETYPES_SXC            (HTTP_Mimetype){".sxc","OpenOffice - Calc (Spreadsheet)","application/vnd.sun.xml.calc"}
#define HTTP_MIMETYPES_STC            (HTTP_Mimetype){".stc","OpenOffice - Calc Template (Spreadsheet)","application/vnd.sun.xml.calc.template"}
#define HTTP_MIMETYPES_SXD            (HTTP_Mimetype){".sxd","OpenOffice - Draw (Graphics)","application/vnd.sun.xml.draw"}
#define HTTP_MIMETYPES_STD            (HTTP_Mimetype){".std","OpenOffice - Draw Template (Graphics)","application/vnd.sun.xml.draw.template"}
#define HTTP_MIMETYPES_SXI            (HTTP_Mimetype){".sxi","OpenOffice - Impress (Presentation)","application/vnd.sun.xml.impress"}
#define HTTP_MIMETYPES_STI            (HTTP_Mimetype){".sti","OpenOffice - Impress Template (Presentation)","application/vnd.sun.xml.impress.template"}
#define HTTP_MIMETYPES_SXM            (HTTP_Mimetype){".sxm","OpenOffice - Math (Formula)","application/vnd.sun.xml.math"}
#define HTTP_MIMETYPES_SXW            (HTTP_Mimetype){".sxw","OpenOffice - Writer (Text - HTML)","application/vnd.sun.xml.writer"}
#define HTTP_MIMETYPES_SXG            (HTTP_Mimetype){".sxg","OpenOffice - Writer (Text - HTML)","application/vnd.sun.xml.writer.global"}
#define HTTP_MIMETYPES_STW            (HTTP_Mimetype){".stw","OpenOffice - Writer Template (Text - HTML)","application/vnd.sun.xml.writer.template"}
#define HTTP_MIMETYPES_OTF            (HTTP_Mimetype){".otf","OpenType Font File","font/otf"}
#define HTTP_MIMETYPES_OSFPVG         (HTTP_Mimetype){".osfpvg","OSFPVG","application/vnd.yamaha.openscoreformat.osfpvg+xml"}
#define HTTP_MIMETYPES_DP             (HTTP_Mimetype){".dp","OSGi Deployment Package","application/vnd.osgi.dp"}
#define HTTP_MIMETYPES_PDB            (HTTP_Mimetype){".pdb","PalmOS Data","application/vnd.palm"}
#define HTTP_MIMETYPES_P              (HTTP_Mimetype){".p","Pascal Source File","text/x-pascal"}
#define HTTP_MIMETYPES_PAW            (HTTP_Mimetype){".paw","PawaaFILE","application/vnd.pawaafile"}
#define HTTP_MIMETYPES_PCLXL          (HTTP_Mimetype){".pclxl","PCL 6 Enhanced (Formely PCL XL)","application/vnd.hp-pclxl"}
#define HTTP_MIMETYPES_EFIF           (HTTP_Mimetype){".efif","Pcsel eFIF File","application/vnd.picsel"}
#define HTTP_MIMETYPES_PCX            (HTTP_Mimetype){".pcx","PCX Image","image/vnd.zbrush.pcx"}
#define HTTP_MIMETYPES_PSD            (HTTP_Mimetype){".psd","Photoshop Document","image/vnd.adobe.photoshop"}
#define HTTP_MIMETYPES_PRF            (HTTP_Mimetype){".prf","PICSRules","application/pics-rules"}
#define HTTP_MIMETYPES_PIC            (HTTP_Mimetype){".pic","PICT Image","image/x-pict"}
#define HTTP_MIMETYPES_CHAT           (HTTP_Mimetype){".chat","pIRCh","application/x-chat"}
#define HTTP_MIMETYPES_P10            (HTTP_Mimetype){".p10","PKCS #10 - Certification Request Standard","application/pkcs10"}
#define HTTP_MIMETYPES_P12            (HTTP_Mimetype){".p12","PKCS #12 - Personal Information Exchange Syntax Standard","application/x-pkcs12"}
#define HTTP_MIMETYPES_P7M            (HTTP_Mimetype){".p7m","PKCS #7 - Cryptographic Message Syntax Standard","application/pkcs7-mime"}
#define HTTP_MIMETYPES_P7S            (HTTP_Mimetype){".p7s","PKCS #7 - Cryptographic Message Syntax Standard","application/pkcs7-signature"}
#define HTTP_MIMETYPES_P7R            (HTTP_Mimetype){".p7r","PKCS #7 - Cryptographic Message Syntax Standard (Certificate Request Response)","application/x-pkcs7-certreqresp"}
#define HTTP_MIMETYPES_P7B            (HTTP_Mimetype){".p7b","PKCS #7 - Cryptographic Message Syntax Standard (Certificates)","application/x-pkcs7-certificates"}
#define HTTP_MIMETYPES_P8             (HTTP_Mimetype){".p8","PKCS #8 - Private-Key Information Syntax Standard","application/pkcs8"}
#define HTTP_MIMETYPES_PLF            (HTTP_Mimetype){".plf","PocketLearn Viewers","application/vnd.pocketlearn"}
#define HTTP_MIMETYPES_PNM            (HTTP_Mimetype){".pnm","Portable Anymap Image","image/x-portable-anymap"}
#define HTTP_MIMETYPES_PBM            (HTTP_Mimetype){".pbm","Portable Bitmap Format","image/x-portable-bitmap"}
#define HTTP_MIMETYPES_PCF            (HTTP_Mimetype){".pcf","Portable Compiled Format","application/x-font-pcf"}
#define HTTP_MIMETYPES_PFR            (HTTP_Mimetype){".pfr","Portable Font Resource","application/font-tdpfr"}
#define HTTP_MIMETYPES_PGN            (HTTP_Mimetype){".pgn","Portable Game Notation (Chess Games)","application/x-chess-pgn"}
#define HTTP_MIMETYPES_PGM            (HTTP_Mimetype){".pgm","Portable Graymap Format","image/x-portable-graymap"}
#define HTTP_MIMETYPES_PNG            (HTTP_Mimetype){".png","Portable Network Graphics (PNG)","image/png"}
#define HTTP_MIMETYPES_PPM            (HTTP_Mimetype){".ppm","Portable Pixmap Format","image/x-portable-pixmap"}
#define HTTP_MIMETYPES_PSKCXML        (HTTP_Mimetype){".pskcxml","Portable Symmetric Key Container","application/pskc+xml"}
#define HTTP_MIMETYPES_PML            (HTTP_Mimetype){".pml","PosML","application/vnd.ctc-posml"}
#define HTTP_MIMETYPES_AI             (HTTP_Mimetype){".ai","PostScript","application/postscript"}
#define HTTP_MIMETYPES_PFA            (HTTP_Mimetype){".pfa","PostScript Fonts","application/x-font-type1"}
#define HTTP_MIMETYPES_PBD            (HTTP_Mimetype){".pbd","PowerBuilder","application/vnd.powerbuilder6"}
#define HTTP_MIMETYPES_PGP            (HTTP_Mimetype){".pgp","Pretty Good Privacy","application/pgp-encrypted"}
#define HTTP_MIMETYPES_PGP            (HTTP_Mimetype){".pgp","Pretty Good Privacy - Signature","application/pgp-encrypted"}
#define HTTP_MIMETYPES_BOX            (HTTP_Mimetype){".box","Preview Systems ZipLock/VBox","application/vnd.previewsystems.box"}
#define HTTP_MIMETYPES_PTID           (HTTP_Mimetype){".ptid","Princeton Video Image","application/vnd.pvi.ptid1"}
#define HTTP_MIMETYPES_PLS            (HTTP_Mimetype){".pls","Pronunciation Lexicon Specification","application/pls+xml"}
#define HTTP_MIMETYPES_STR            (HTTP_Mimetype){".str","Proprietary P&G Standard Reporting System","application/vnd.pg.format"}
#define HTTP_MIMETYPES_EI6            (HTTP_Mimetype){".ei6","Proprietary P&G Standard Reporting System","application/vnd.pg.osasli"}
#define HTTP_MIMETYPES_DSC            (HTTP_Mimetype){".dsc","PRS Lines Tag","text/prs.lines.tag"}
#define HTTP_MIMETYPES_PSF            (HTTP_Mimetype){".psf","PSF Fonts","application/x-font-linux-psf"}
#define HTTP_MIMETYPES_QPS            (HTTP_Mimetype){".qps","PubliShare Objects","application/vnd.publishare-delta-tree"}
#define HTTP_MIMETYPES_WG             (HTTP_Mimetype){".wg","Qualcomm's Plaza Mobile Internet","application/vnd.pmi.widget"}
#define HTTP_MIMETYPES_QXD            (HTTP_Mimetype){".qxd","QuarkXpress","application/vnd.quark.quarkxpress"}
#define HTTP_MIMETYPES_ESF            (HTTP_Mimetype){".esf","QUASS Stream Player","application/vnd.epson.esf"}
#define HTTP_MIMETYPES_MSF            (HTTP_Mimetype){".msf","QUASS Stream Player","application/vnd.epson.msf"}
#define HTTP_MIMETYPES_SSF            (HTTP_Mimetype){".ssf","QUASS Stream Player","application/vnd.epson.ssf"}
#define HTTP_MIMETYPES_QAM            (HTTP_Mimetype){".qam","QuickAnime Player","application/vnd.epson.quickanime"}
#define HTTP_MIMETYPES_QFX            (HTTP_Mimetype){".qfx","Quicken","application/vnd.intu.qfx"}
#define HTTP_MIMETYPES_QT             (HTTP_Mimetype){".qt","Quicktime Video","video/quicktime"}
#define HTTP_MIMETYPES_RAR            (HTTP_Mimetype){".rar","RAR Archive","application/x-rar-compressed"}
#define HTTP_MIMETYPES_RAM            (HTTP_Mimetype){".ram","Real Audio Sound","audio/x-pn-realaudio"}
#define HTTP_MIMETYPES_RMP            (HTTP_Mimetype){".rmp","Real Audio Sound","audio/x-pn-realaudio-plugin"}
#define HTTP_MIMETYPES_RSD            (HTTP_Mimetype){".rsd","Really Simple Discovery","application/rsd+xml"}
#define HTTP_MIMETYPES_RM             (HTTP_Mimetype){".rm","RealMedia","application/vnd.rn-realmedia"}
#define HTTP_MIMETYPES_BED            (HTTP_Mimetype){".bed","RealVNC","application/vnd.realvnc.bed"}
#define HTTP_MIMETYPES_MXL            (HTTP_Mimetype){".mxl","Recordare Applications","application/vnd.recordare.musicxml"}
#define HTTP_MIMETYPES_MUSICXML       (HTTP_Mimetype){".musicxml","Recordare Applications","application/vnd.recordare.musicxml+xml"}
#define HTTP_MIMETYPES_RNC            (HTTP_Mimetype){".rnc","Relax NG Compact Syntax","application/relax-ng-compact-syntax"}
#define HTTP_MIMETYPES_RDZ            (HTTP_Mimetype){".rdz","RemoteDocs R-Viewer","application/vnd.data-vision.rdz"}
#define HTTP_MIMETYPES_RDF            (HTTP_Mimetype){".rdf","Resource Description Framework","application/rdf+xml"}
#define HTTP_MIMETYPES_RP9            (HTTP_Mimetype){".rp9","RetroPlatform Player","application/vnd.cloanto.rp9"}
#define HTTP_MIMETYPES_JISP           (HTTP_Mimetype){".jisp","RhymBox","application/vnd.jisp"}
#define HTTP_MIMETYPES_RTF            (HTTP_Mimetype){".rtf","Rich Text Format","application/rtf"}
#define HTTP_MIMETYPES_RTX            (HTTP_Mimetype){".rtx","Rich Text Format (RTF)","text/richtext"}
#define HTTP_MIMETYPES_LINK66         (HTTP_Mimetype){".link66","ROUTE 66 Location Based Services","application/vnd.route66.link66+xml"}
#define HTTP_MIMETYPES_RSS            (HTTP_Mimetype){".rss","RSS - Really Simple Syndication","application/rss+xml"}
#define HTTP_MIMETYPES_SHF            (HTTP_Mimetype){".shf","S Hexdump Format","application/shf+xml"}
#define HTTP_MIMETYPES_ST             (HTTP_Mimetype){".st","SailingTracker","application/vnd.sailingtracker.track"}
#define HTTP_MIMETYPES_SVG            (HTTP_Mimetype){".svg","Scalable Vector Graphics (SVG)","image/svg+xml"}
#define HTTP_MIMETYPES_SUS            (HTTP_Mimetype){".sus","ScheduleUs","application/vnd.sus-calendar"}
#define HTTP_MIMETYPES_SRU            (HTTP_Mimetype){".sru","Search/Retrieve via URL Response Format","application/sru+xml"}
#define HTTP_MIMETYPES_SETPAY         (HTTP_Mimetype){".setpay","Secure Electronic Transaction - Payment","application/set-payment-initiation"}
#define HTTP_MIMETYPES_SETREG         (HTTP_Mimetype){".setreg","Secure Electronic Transaction - Registration","application/set-registration-initiation"}
#define HTTP_MIMETYPES_SEMA           (HTTP_Mimetype){".sema","Secured eMail","application/vnd.sema"}
#define HTTP_MIMETYPES_SEMD           (HTTP_Mimetype){".semd","Secured eMail","application/vnd.semd"}
#define HTTP_MIMETYPES_SEMF           (HTTP_Mimetype){".semf","Secured eMail","application/vnd.semf"}
#define HTTP_MIMETYPES_SEE            (HTTP_Mimetype){".see","SeeMail","application/vnd.seemail"}
#define HTTP_MIMETYPES_SNF            (HTTP_Mimetype){".snf","Server Normal Format","application/x-font-snf"}
#define HTTP_MIMETYPES_SPQ            (HTTP_Mimetype){".spq","Server-Based Certificate Validation Protocol - Validation Policies - Request","application/scvp-vp-request"}
#define HTTP_MIMETYPES_SPP            (HTTP_Mimetype){".spp","Server-Based Certificate Validation Protocol - Validation Policies - Response","application/scvp-vp-response"}
#define HTTP_MIMETYPES_SCQ            (HTTP_Mimetype){".scq","Server-Based Certificate Validation Protocol - Validation Request","application/scvp-cv-request"}
#define HTTP_MIMETYPES_SCS            (HTTP_Mimetype){".scs","Server-Based Certificate Validation Protocol - Validation Response","application/scvp-cv-response"}
#define HTTP_MIMETYPES_SDP            (HTTP_Mimetype){".sdp","Session Description Protocol","application/sdp"}
#define HTTP_MIMETYPES_ETX            (HTTP_Mimetype){".etx","Setext","text/x-setext"}
#define HTTP_MIMETYPES_MOVIE          (HTTP_Mimetype){".movie","SGI Movie","video/x-sgi-movie"}
#define HTTP_MIMETYPES_IFM            (HTTP_Mimetype){".ifm","Shana Informed Filler","application/vnd.shana.informed.formdata"}
#define HTTP_MIMETYPES_ITP            (HTTP_Mimetype){".itp","Shana Informed Filler","application/vnd.shana.informed.formtemplate"}
#define HTTP_MIMETYPES_IIF            (HTTP_Mimetype){".iif","Shana Informed Filler","application/vnd.shana.informed.interchange"}
#define HTTP_MIMETYPES_IPK            (HTTP_Mimetype){".ipk","Shana Informed Filler","application/vnd.shana.informed.package"}
#define HTTP_MIMETYPES_TFI            (HTTP_Mimetype){".tfi","Sharing Transaction Fraud Data","application/thraud+xml"}
#define HTTP_MIMETYPES_SHAR           (HTTP_Mimetype){".shar","Shell Archive","application/x-shar"}
#define HTTP_MIMETYPES_RGB            (HTTP_Mimetype){".rgb","Silicon Graphics RGB Bitmap","image/x-rgb"}
#define HTTP_MIMETYPES_SLT            (HTTP_Mimetype){".slt","SimpleAnimeLite Player","application/vnd.epson.salt"}
#define HTTP_MIMETYPES_ASO            (HTTP_Mimetype){".aso","Simply Accounting","application/vnd.accpac.simply.aso"}
#define HTTP_MIMETYPES_IMP            (HTTP_Mimetype){".imp","Simply Accounting - Data Import","application/vnd.accpac.simply.imp"}
#define HTTP_MIMETYPES_TWD            (HTTP_Mimetype){".twd","SimTech MindMapper","application/vnd.simtech-mindmapper"}
#define HTTP_MIMETYPES_CSP            (HTTP_Mimetype){".csp","Sixth Floor Media - CommonSpace","application/vnd.commonspace"}
#define HTTP_MIMETYPES_SAF            (HTTP_Mimetype){".saf","SMAF Audio","application/vnd.yamaha.smaf-audio"}
#define HTTP_MIMETYPES_MMF            (HTTP_Mimetype){".mmf","SMAF File","application/vnd.smaf"}
#define HTTP_MIMETYPES_SPF            (HTTP_Mimetype){".spf","SMAF Phrase","application/vnd.yamaha.smaf-phrase"}
#define HTTP_MIMETYPES_TEACHER        (HTTP_Mimetype){".teacher","SMART Technologies Apps","application/vnd.smart.teacher"}
#define HTTP_MIMETYPES_SVD            (HTTP_Mimetype){".svd","SourceView Document","application/vnd.svd"}
#define HTTP_MIMETYPES_RQ             (HTTP_Mimetype){".rq","SPARQL - Query","application/sparql-query"}
#define HTTP_MIMETYPES_SRX            (HTTP_Mimetype){".srx","SPARQL - Results","application/sparql-results+xml"}
#define HTTP_MIMETYPES_GRAM           (HTTP_Mimetype){".gram","Speech Recognition Grammar Specification","application/srgs"}
#define HTTP_MIMETYPES_GRXML          (HTTP_Mimetype){".grxml","Speech Recognition Grammar Specification - XML","application/srgs+xml"}
#define HTTP_MIMETYPES_SSML           (HTTP_Mimetype){".ssml","Speech Synthesis Markup Language","application/ssml+xml"}
#define HTTP_MIMETYPES_SKP            (HTTP_Mimetype){".skp","SSEYO Koan Play File","application/vnd.koan"}
#define HTTP_MIMETYPES_SGML           (HTTP_Mimetype){".sgml","Standard Generalized Markup Language (SGML)","text/sgml"}
#define HTTP_MIMETYPES_SDC            (HTTP_Mimetype){".sdc","StarOffice - Calc","application/vnd.stardivision.calc"}
#define HTTP_MIMETYPES_SDA            (HTTP_Mimetype){".sda","StarOffice - Draw","application/vnd.stardivision.draw"}
#define HTTP_MIMETYPES_SDD            (HTTP_Mimetype){".sdd","StarOffice - Impress","application/vnd.stardivision.impress"}
#define HTTP_MIMETYPES_SMF            (HTTP_Mimetype){".smf","StarOffice - Math","application/vnd.stardivision.math"}
#define HTTP_MIMETYPES_SDW            (HTTP_Mimetype){".sdw","StarOffice - Writer","application/vnd.stardivision.writer"}
#define HTTP_MIMETYPES_SGL            (HTTP_Mimetype){".sgl","StarOffice - Writer (Global)","application/vnd.stardivision.writer-global"}
#define HTTP_MIMETYPES_SM             (HTTP_Mimetype){".sm","StepMania","application/vnd.stepmania.stepchart"}
#define HTTP_MIMETYPES_SIT            (HTTP_Mimetype){".sit","Stuffit Archive","application/x-stuffit"}
#define HTTP_MIMETYPES_SITX           (HTTP_Mimetype){".sitx","Stuffit Archive","application/x-stuffitx"}
#define HTTP_MIMETYPES_SDKM           (HTTP_Mimetype){".sdkm","SudokuMagic","application/vnd.solent.sdkm+xml"}
#define HTTP_MIMETYPES_XO             (HTTP_Mimetype){".xo","Sugar Linux Application Bundle","application/vnd.olpc-sugar"}
#define HTTP_MIMETYPES_AU             (HTTP_Mimetype){".au","Sun Audio - Au file format","audio/basic"}
#define HTTP_MIMETYPES_WQD            (HTTP_Mimetype){".wqd","SundaHus WQ","application/vnd.wqd"}
#define HTTP_MIMETYPES_SIS            (HTTP_Mimetype){".sis","Symbian Install Package","application/vnd.symbian.install"}
#define HTTP_MIMETYPES_SMI            (HTTP_Mimetype){".smi","Synchronized Multimedia Integration Language","application/smil+xml"}
#define HTTP_MIMETYPES_XSM            (HTTP_Mimetype){".xsm","SyncML","application/vnd.syncml+xml"}
#define HTTP_MIMETYPES_BDM            (HTTP_Mimetype){".bdm","SyncML - Device Management","application/vnd.syncml.dm+wbxml"}
#define HTTP_MIMETYPES_XDM            (HTTP_Mimetype){".xdm","SyncML - Device Management","application/vnd.syncml.dm+xml"}
#define HTTP_MIMETYPES_SV4CPIO        (HTTP_Mimetype){".sv4cpio","System V Release 4 CPIO Archive","application/x-sv4cpio"}
#define HTTP_MIMETYPES_SV4CRC         (HTTP_Mimetype){".sv4crc","System V Release 4 CPIO Checksum Data","application/x-sv4crc"}
#define HTTP_MIMETYPES_SBML           (HTTP_Mimetype){".sbml","Systems Biology Markup Language","application/sbml+xml"}
#define HTTP_MIMETYPES_TSV            (HTTP_Mimetype){".tsv","Tab Seperated Values","text/tab-separated-values"}
#define HTTP_MIMETYPES_TIFF           (HTTP_Mimetype){".tiff","Tagged Image File Format","image/tiff"}
#define HTTP_MIMETYPES_TAO            (HTTP_Mimetype){".tao","Tao Intent","application/vnd.tao.intent-module-archive"}
#define HTTP_MIMETYPES_TAR            (HTTP_Mimetype){".tar","Tar File (Tape Archive)","application/x-tar"}
#define HTTP_MIMETYPES_TCL            (HTTP_Mimetype){".tcl","Tcl Script","application/x-tcl"}
#define HTTP_MIMETYPES_TEX            (HTTP_Mimetype){".tex","TeX","application/x-tex"}
#define HTTP_MIMETYPES_TFM            (HTTP_Mimetype){".tfm","TeX Font Metric","application/x-tex-tfm"}
#define HTTP_MIMETYPES_TEI            (HTTP_Mimetype){".tei","Text Encoding and Interchange","application/tei+xml"}
#define HTTP_MIMETYPES_TXT            (HTTP_Mimetype){".txt","Text File","text/plain"}
#define HTTP_MIMETYPES_DXP            (HTTP_Mimetype){".dxp","TIBCO Spotfire","application/vnd.spotfire.dxp"}
#define HTTP_MIMETYPES_SFS            (HTTP_Mimetype){".sfs","TIBCO Spotfire","application/vnd.spotfire.sfs"}
#define HTTP_MIMETYPES_TSD            (HTTP_Mimetype){".tsd","Time Stamped Data Envelope","application/timestamped-data"}
#define HTTP_MIMETYPES_TPT            (HTTP_Mimetype){".tpt","TRI Systems Config","application/vnd.trid.tpt"}
#define HTTP_MIMETYPES_MXS            (HTTP_Mimetype){".mxs","Triscape Map Explorer","application/vnd.triscape.mxs"}
#define HTTP_MIMETYPES_T              (HTTP_Mimetype){".t","troff","text/troff"}
#define HTTP_MIMETYPES_TRA            (HTTP_Mimetype){".tra","True BASIC","application/vnd.trueapp"}
#define HTTP_MIMETYPES_TTF            (HTTP_Mimetype){".ttf","TrueType Font","font/ttf"}
#define HTTP_MIMETYPES_TTL            (HTTP_Mimetype){".ttl","Turtle (Terse RDF Triple Language)","text/turtle"}
#define HTTP_MIMETYPES_UMJ            (HTTP_Mimetype){".umj","UMAJIN","application/vnd.umajin"}
#define HTTP_MIMETYPES_UOML           (HTTP_Mimetype){".uoml","Unique Object Markup Language","application/vnd.uoml+xml"}
#define HTTP_MIMETYPES_UNITYWEB       (HTTP_Mimetype){".unityweb","Unity 3d","application/vnd.unity"}
#define HTTP_MIMETYPES_UFD            (HTTP_Mimetype){".ufd","Universal Forms Description Language","application/vnd.ufdl"}
#define HTTP_MIMETYPES_URI            (HTTP_Mimetype){".uri","URI Resolution Services","text/uri-list"}
#define HTTP_MIMETYPES_UTZ            (HTTP_Mimetype){".utz","User Interface Quartz - Theme (Symbian)","application/vnd.uiq.theme"}
#define HTTP_MIMETYPES_USTAR          (HTTP_Mimetype){".ustar","Ustar (Uniform Standard Tape Archive)","application/x-ustar"}
#define HTTP_MIMETYPES_UU             (HTTP_Mimetype){".uu","UUEncode","text/x-uuencode"}
#define HTTP_MIMETYPES_VCS            (HTTP_Mimetype){".vcs","vCalendar","text/x-vcalendar"}
#define HTTP_MIMETYPES_VCF            (HTTP_Mimetype){".vcf","vCard","text/x-vcard"}
#define HTTP_MIMETYPES_VCD            (HTTP_Mimetype){".vcd","Video CD","application/x-cdlink"}
#define HTTP_MIMETYPES_VSF            (HTTP_Mimetype){".vsf","Viewport+","application/vnd.vsf"}
#define HTTP_MIMETYPES_WRL            (HTTP_Mimetype){".wrl","Virtual Reality Modeling Language","model/vrml"}
#define HTTP_MIMETYPES_VCX            (HTTP_Mimetype){".vcx","VirtualCatalog","application/vnd.vcx"}
#define HTTP_MIMETYPES_MTS            (HTTP_Mimetype){".mts","Virtue MTS","model/vnd.mts"}
#define HTTP_MIMETYPES_VTU            (HTTP_Mimetype){".vtu","Virtue VTU","model/vnd.vtu"}
#define HTTP_MIMETYPES_VIS            (HTTP_Mimetype){".vis","Visionary","application/vnd.visionary"}
#define HTTP_MIMETYPES_VIV            (HTTP_Mimetype){".viv","Vivo","video/vnd.vivo"}
#define HTTP_MIMETYPES_CCXML          (HTTP_Mimetype){".ccxml","Voice Browser Call Control","application/ccxml+xml"}
#define HTTP_MIMETYPES_VXML           (HTTP_Mimetype){".vxml","VoiceXML","application/voicexml+xml"}
#define HTTP_MIMETYPES_SRC            (HTTP_Mimetype){".src","WAIS Source","application/x-wais-source"}
#define HTTP_MIMETYPES_WBXML          (HTTP_Mimetype){".wbxml","WAP Binary XML (WBXML)","application/vnd.wap.wbxml"}
#define HTTP_MIMETYPES_WBMP           (HTTP_Mimetype){".wbmp","WAP Bitamp (WBMP)","image/vnd.wap.wbmp"}
#define HTTP_MIMETYPES_WAV            (HTTP_Mimetype){".wav","Waveform Audio File Format (WAV)","audio/wav"}
#define HTTP_MIMETYPES_DAVMOUNT       (HTTP_Mimetype){".davmount","Web Distributed Authoring and Versioning","application/davmount+xml"}
#define HTTP_MIMETYPES_WOFF           (HTTP_Mimetype){".woff","Web Open Font Format","font/woff"}
#define HTTP_MIMETYPES_WSPOLICY       (HTTP_Mimetype){".wspolicy","Web Services Policy","application/wspolicy+xml"}
#define HTTP_MIMETYPES_WEBP           (HTTP_Mimetype){".webp","WebP Image","image/webp"}
#define HTTP_MIMETYPES_WTB            (HTTP_Mimetype){".wtb","WebTurbo","application/vnd.webturbo"}
#define HTTP_MIMETYPES_WGT            (HTTP_Mimetype){".wgt","Widget Packaging and XML Configuration","application/widget"}
#define HTTP_MIMETYPES_HLP            (HTTP_Mimetype){".hlp","WinHelp","application/winhlp"}
#define HTTP_MIMETYPES_WML            (HTTP_Mimetype){".wml","Wireless Markup Language (WML)","text/vnd.wap.wml"}
#define HTTP_MIMETYPES_WMLS           (HTTP_Mimetype){".wmls","Wireless Markup Language Script (WMLScript)","text/vnd.wap.wmlscript"}
#define HTTP_MIMETYPES_WMLSC          (HTTP_Mimetype){".wmlsc","WMLScript","application/vnd.wap.wmlscriptc"}
#define HTTP_MIMETYPES_WPD            (HTTP_Mimetype){".wpd","Wordperfect","application/vnd.wordperfect"}
#define HTTP_MIMETYPES_STF            (HTTP_Mimetype){".stf","Worldtalk","application/vnd.wt.stf"}
#define HTTP_MIMETYPES_WSDL           (HTTP_Mimetype){".wsdl","WSDL - Web Services Description Language","application/wsdl+xml"}
#define HTTP_MIMETYPES_XBM            (HTTP_Mimetype){".xbm","X BitMap","image/x-xbitmap"}
#define HTTP_MIMETYPES_XPM            (HTTP_Mimetype){".xpm","X PixMap","image/x-xpixmap"}
#define HTTP_MIMETYPES_XWD            (HTTP_Mimetype){".xwd","X Window Dump","image/x-xwindowdump"}
#define HTTP_MIMETYPES_DER            (HTTP_Mimetype){".der","X.509 Certificate","application/x-x509-ca-cert"}
#define HTTP_MIMETYPES_FIG            (HTTP_Mimetype){".fig","Xfig","application/x-xfig"}
#define HTTP_MIMETYPES_XHTML          (HTTP_Mimetype){".xhtml","XHTML - The Extensible HyperText Markup Language","application/xhtml+xml"}
#define HTTP_MIMETYPES_XML            (HTTP_Mimetype){".xml","XML - Extensible Markup Language","application/xml"}
#define HTTP_MIMETYPES_XDF            (HTTP_Mimetype){".xdf","XML Configuration Access Protocol - XCAP Diff","application/xcap-diff+xml"}
#define HTTP_MIMETYPES_XENC           (HTTP_Mimetype){".xenc","XML Encryption Syntax and Processing","application/xenc+xml"}
#define HTTP_MIMETYPES_XER            (HTTP_Mimetype){".xer","XML Patch Framework","application/patch-ops-error+xml"}
#define HTTP_MIMETYPES_RL             (HTTP_Mimetype){".rl","XML Resource Lists","application/resource-lists+xml"}
#define HTTP_MIMETYPES_RS             (HTTP_Mimetype){".rs","XML Resource Lists","application/rls-services+xml"}
#define HTTP_MIMETYPES_RLD            (HTTP_Mimetype){".rld","XML Resource Lists Diff","application/resource-lists-diff+xml"}
#define HTTP_MIMETYPES_XSLT           (HTTP_Mimetype){".xslt","XML Transformations","application/xslt+xml"}
#define HTTP_MIMETYPES_XOP            (HTTP_Mimetype){".xop","XML-Binary Optimized Packaging","application/xop+xml"}
#define HTTP_MIMETYPES_XPI            (HTTP_Mimetype){".xpi","XPInstall - Mozilla","application/x-xpinstall"}
#define HTTP_MIMETYPES_XSPF           (HTTP_Mimetype){".xspf","XSPF - XML Shareable Playlist Format","application/xspf+xml"}
#define HTTP_MIMETYPES_XUL            (HTTP_Mimetype){".xul","XUL - XML User Interface Language","application/vnd.mozilla.xul+xml"}
#define HTTP_MIMETYPES_XYZ            (HTTP_Mimetype){".xyz","XYZ File Format","chemical/x-xyz"}
#define HTTP_MIMETYPES_YAML           (HTTP_Mimetype){".yaml","YAML Ain't Markup Language / Yet Another Markup Language","text/yaml"}
#define HTTP_MIMETYPES_YANG           (HTTP_Mimetype){".yang","YANG Data Modeling Language","application/yang"}
#define HTTP_MIMETYPES_YIN            (HTTP_Mimetype){".yin","YIN (YANG - XML)","application/yin+xml"}
#define HTTP_MIMETYPES_ZIR            (HTTP_Mimetype){".zir","Z.U.L. Geometry","application/vnd.zul"}
#define HTTP_MIMETYPES_ZIP            (HTTP_Mimetype){".zip","Zip Archive","application/zip"}
#define HTTP_MIMETYPES_ZMM            (HTTP_Mimetype){".zmm","ZVUE Media Manager","application/vnd.handheld-entertainment+xml"}
#define HTTP_MIMETYPES_ZAZ            (HTTP_Mimetype){".zaz","Zzazz Deck","application/vnd.zzazz.deck+xml"}
//}

HTTP_Mimetype** HTTP_MIMETYPE_LIST = NULL;
HTTP_Tree* HTTP_MIMETYPE_STORAGE = NULL;

HTTP_Mimetype* http_mimetype_create(HTTP_Mimetype type) {
    HTTP_Mimetype* t = (HTTP_Mimetype*)malloc(sizeof(HTTP_Mimetype));
    if (!t) exit(2);
    memset(t,0,sizeof(HTTP_Mimetype));
    char *ext = (char*)malloc((strlen(type.ext)+1)*sizeof(char));
    if (!ext) exit(2);
    ext[0] = '\0';
    strcat(ext,type.ext);
    char *name = (char*)malloc((strlen(type.name)+1)*sizeof(char));
    if (!name) exit(2);
    name[0] = '\0';
    strcat(name,type.name);
    char *mtype = (char*)malloc((strlen(type.type)+1)*sizeof(char));
    if (!mtype) exit(2);
    mtype[0] = '\0';
    strcat(mtype,type.type);
    t->ext = ext;
    t->name = name;
    t->type = mtype;
    return t;
}

void http_mimetype_free(HTTP_Mimetype* t) {
    if (t) {
        if (t->ext) free(t->ext);
        if (t->name) free(t->name);
        if (t->type) free(t->type);
        free(t);
    }
}

void http_mimetype_list_init_t() {
    if (HTTP_MIMETYPE_LIST!=NULL) return;
    int i=0;HTTP_MIMETYPE_LIST=(HTTP_Mimetype**)malloc((689+1)*sizeof(HTTP_Mimetype*));if(!HTTP_MIMETYPE_LIST){exit(2);};HTTP_MIMETYPE_LIST[689]=NULL;HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_X3D);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_3GP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_3G2);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MSEQ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PWN);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PLB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PSB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PVB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TCAP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_7Z);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ABW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ACE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ACC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ACU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ATC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ADP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AAB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AAM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AAS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AIR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SWF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FXP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PDF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PPD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DIR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XDP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XFDF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AAC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AHEAD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AZF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AZS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AZW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AMI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_APK);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CII);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FTI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ATX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DMG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MPKG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LES);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SWI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_S);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ATOMCAT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ATOMSVC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ATOM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AIF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AVI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AEP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DXF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DWF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PAR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BCPIO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BIN);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BMP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TORRENT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_COD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MPM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BMI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SH);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BTIF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_REP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BZ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BZ2);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CSH);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_C);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDXML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CSS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CSML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDBCMSG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CLA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_C4G);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SUB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDMIA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDMIC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDMID);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDMIO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDMIQ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_C11AMC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_C11AMZ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RAS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DAE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CSV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CPT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WMLC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CGM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ICE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CMX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XAR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CMC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CPIO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CLKX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CLKK);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CLKP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CLKT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CLKW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WBS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CRYPTONOTE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CIF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CMDF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CWW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CURL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DCURL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MCURL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SCURL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CAR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PCURL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CMP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DSSC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XDSSC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DEB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UVA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UVI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UVH);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UVM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UVU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UVP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UVS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UVV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DVI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SEED);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DTB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RES);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AIT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SVC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EOL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DJVU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DTD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MLP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WAD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DPG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DRA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DFAC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DTS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DTSHD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DWG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GEO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ES);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MAG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MMR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RLC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EXI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MGZ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EPUB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XPR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XIF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XFDL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EMMA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EZ2);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EZ3);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FST);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FVT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FBS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FE_LAUNCH);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_F4V);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FLV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FPX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NPX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FLX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FLI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FTC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FDF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_F);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MIF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FH);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FSC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FNC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LTF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DDD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XDW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XBD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OAS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OA2);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OA3);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FG5);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BH2);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SPL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FZS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_G3);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GMX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GTW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TXD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GGB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GGT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GDL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GEX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GXT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_G2W);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_G3W);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GSF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BDF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GTAR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TEXINFO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GNUMERIC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KMZ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GPX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GQF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GIF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GAC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GHF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GIM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GRV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GTM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TPL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VCG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_H261);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_H263);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_H264);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HPID);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HPS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HDF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RIP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HBCI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JLT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PCL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HPGL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HVS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HVD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HVP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SFD_HDSTX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_STK);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HAL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HTML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IRM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ICS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ICC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ICO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IGL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IEF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IVP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IVU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RIF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_3DML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SPOT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IGS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_I2G);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDY);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XPW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FCS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IPFIX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CER);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PKI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CRL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PKIPATH);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IGM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RCPROFILE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IRP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JAD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JAR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CLASS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JNLP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SER);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AVA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JSON);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JODA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JPM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JPEG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JPG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PJPEG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JPGV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KTZ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MMD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KARBON);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CHRT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KFO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FLW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KON);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KPR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KSP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KWD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HTKE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KIA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KNE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SSE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LASXML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LATEX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LBD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LBE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JAM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_123);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_APR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PRE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NSF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ORG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SCM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LWP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LVP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_M3U);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_M4V);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HQX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PORTPKG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MGP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MRC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MRCX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MXF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NBP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MATHML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MBOX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MC1);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MSCML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CDKEY);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MWF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MFM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MSH);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MADS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_METS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MODS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_META4);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MCD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FLO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IGX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ES3);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MDB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ASF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EXE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CIL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CAB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IMS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_APPLICATION);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CLP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MDI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EOT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XLS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XLAM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XLSB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XLTM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XLSM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CHM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CRD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LRM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MVB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MNY);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PPTX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SLDX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PPSX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_POTX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XLSX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XLTX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DOCX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DOTX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OBD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_THMX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ONETOC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PYA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PYV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PPT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PPAM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SLDM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PPTM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PPSM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_POTM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MPP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PUB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SCD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XAP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_STL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CAT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VSD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VSDX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WMA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WAX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WMX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WMD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WPL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WMZ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WMV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WVX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WMF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TRM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DOC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DOCM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DOTM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WRI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WPS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XBAP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XPS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MID);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MPY);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AFP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RMS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TMO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PRC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MBK);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DIS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PLC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MQY);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MSL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TXF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DAF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FLY);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MPC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MPN);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MJ2);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MPGA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MXU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MPEG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_M21);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MP4A);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MP3);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MP4);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_M3U8);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MUS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MSTY);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MXML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NGDAT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_N_GAGE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NCX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NLU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DNA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NND);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NNS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_NNW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RPST);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RPSS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_N3);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EDM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EDX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EXT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GPH);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ECELP4800);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ECELP7470);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ECELP9600);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OGX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OGA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OGV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DD2);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OTH);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OPF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_QBO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OXT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OSF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WEBA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WEBM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OTC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODFT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OTG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OTI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OTP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OTS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ODM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OTT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_KTX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SXC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_STC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SXD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_STD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SXI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_STI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SXM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SXW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SXG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_STW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OTF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_OSFPVG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PDB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_P);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PAW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PCLXL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EFIF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PCX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PSD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PRF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PIC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CHAT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_P10);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_P12);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_P7M);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_P7S);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_P7R);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_P7B);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_P8);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PLF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PNM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PBM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PCF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PFR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PGN);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PGM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PNG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PPM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PSKCXML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PFA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PBD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PGP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PGP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BOX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PTID);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PLS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_STR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_EI6);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DSC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_PSF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_QPS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_QXD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ESF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MSF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SSF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_QAM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_QFX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_QT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RAR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RAM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RMP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RSD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BED);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MXL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MUSICXML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RNC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RDZ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RDF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RP9);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_JISP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RTF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RTX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_LINK66);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RSS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SHF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ST);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SVG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SUS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SRU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SETPAY);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SETREG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SEMA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SEMD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SEMF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SEE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SNF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SPQ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SPP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SCQ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SCS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SDP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ETX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MOVIE);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IFM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ITP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IIF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IPK);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TFI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SHAR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RGB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SLT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ASO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_IMP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TWD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CSP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SAF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MMF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SPF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TEACHER);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SVD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RQ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SRX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GRAM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_GRXML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SSML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SKP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SGML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SDC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SDA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SDD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SMF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SDW);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SGL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SIT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SITX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SDKM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_AU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WQD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SIS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SMI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XSM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_BDM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XDM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SV4CPIO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SV4CRC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SBML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TSV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TIFF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TAO);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TAR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TCL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TEX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TFM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TEI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TXT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DXP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SFS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TSD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TPT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MXS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_T);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TRA);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TTF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_TTL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UMJ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UOML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UNITYWEB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UFD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_URI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UTZ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_USTAR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_UU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VCS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VCF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VCD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VSF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WRL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VCX);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_MTS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VTU);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VIS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VIV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_CCXML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_VXML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_SRC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WBXML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WBMP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WAV);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DAVMOUNT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WOFF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WSPOLICY);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WEBP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WTB);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WGT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_HLP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WMLS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WMLSC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WPD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_STF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_WSDL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XBM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XPM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XWD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_DER);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_FIG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XHTML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XDF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XENC);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XER);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RS);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_RLD);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XSLT);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XOP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XPI);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XSPF);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XUL);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_XYZ);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_YAML);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_YANG);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_YIN);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ZIR);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ZIP);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ZMM);HTTP_MIMETYPE_LIST[i++]=http_mimetype_create(HTTP_MIMETYPES_ZAZ);
}

void http_mimetype_list_init() {
    if (HTTP_MIMETYPE_STORAGE!=NULL) return;
    http_mimetype_list_init_t();
    HTTP_MIMETYPE_STORAGE = http_tree_create();
    int i = 0;
    while (HTTP_MIMETYPE_LIST[i]!=NULL) {
        HTTP_Node* n = http_node_create(HTTP_MIMETYPE_LIST[i]->ext,(void*)HTTP_MIMETYPE_LIST[i]);
        http_tree_insert(HTTP_MIMETYPE_STORAGE,n);
        http_node_free(n);
        i++;
    }
    http_tree_compact(HTTP_MIMETYPE_STORAGE);
}

void http_mimetype_list_end() {
    if (HTTP_MIMETYPE_LIST != NULL) {
        int i = 0;
        while (i < 689) {
            http_mimetype_free(HTTP_MIMETYPE_LIST[i]);
            i++;
        }
        free(HTTP_MIMETYPE_LIST);
        HTTP_MIMETYPE_LIST = NULL;
    }
    if (HTTP_MIMETYPE_STORAGE != NULL) {
        http_tree_free(HTTP_MIMETYPE_STORAGE);
        HTTP_MIMETYPE_STORAGE = NULL;
    }
}

char* http_mimetype_get_type(char *ext) {
    HTTP_Node* n = http_tree_get(HTTP_MIMETYPE_STORAGE,ext);
    if (!n) return NULL;
    HTTP_Mimetype* t = (HTTP_Mimetype*)n->data;
    if (!t) return NULL;
    return t->type;
}


/**********************\
*                      *
*         HTTP         *
*  ROUTER && ENDPOINT  *
*                      *
\**********************/

struct HTTP_Client;
struct HTTP_Request;

typedef struct HTTP_Endpoint {
    char *path;
    int any_request;
    void *(*event)(struct HTTP_Client*,struct HTTP_Request*);
    struct HTTP_Router *router;
} HTTP_Endpoint;

typedef struct HTTP_Router {
    char *path;
    HTTP_Endpoint** endpoints;
    int size;
    int length;
} HTTP_Router;

/**
 * [HTTP_Router] : ""
 *        -> [FUNCTION] : "/"
 *        -> [FUNCTION] : "/salut"
 *        -> [HTTP_Router] : "/lol"
 *                  -> [FUNCTION] : ""
 *                  -> [FUNCTION] : "/salut"
 *        -> [HTTP_Router] : "/hello"
 *                  -> [FUNCTION] : ""
 *                  -> [HTTP_Router] : "/world"
 *                            -> [FUNCTION] : ""
 *                            -> [FUNCTION] : "/omg"
 *        -> [FUNCTION] : "/wow"
 ***************************************************
 * This structure will produce this web app ->
 *     "/"
 *     "/salut"
 *     "/lol"
 *     "/lol/salut"
 *     "/hello"
 *     "/hello/world"
 *     "/hello/world/omg"
 *     "/wow"
 **/



static void *(*http_router_get_match_path_temp(HTTP_Router *r, char *path, char *temp))(struct HTTP_Client*,struct HTTP_Request*) {
    
    // If r is a NULL pointer return a NULL pointer
    if (!r) {
        if (temp != NULL) free(temp);
        return NULL;
    }
    
    // If no endpoints is connected to the router then return a NULL pointer
    if (!(r->endpoints)) {
        if (temp != NULL) free(temp);
        return NULL;
    }
    
    // Iterate on each endpoint
    int i = 0;
    while (r->endpoints[i] != NULL) {
        
        // Build path
        int templen = temp == NULL ? 0 : strlen(temp);
        char *test = (char*)malloc(strlen(r->path)+strlen(r->endpoints[i]->path)+templen+1);
        if (!test) return NULL;
        test[0] = '\0';
        if (temp != NULL) {
            strcat(test,temp);
            free(temp);
            temp = NULL;
        }
        strcat(test,r->path);
        strcat(test,r->endpoints[i]->path);
        
        // If endpoint accept any request (wildcard), then process endpoint
        if (r->endpoints[i]->any_request) {
            
            // If an event function is attached to the endpoint then return the event function
            if (r->endpoints[i]->event != NULL) {
                
                free(test);
                return r->endpoints[i]->event;
            
            // Else try to check if a router is connected to the endpoint
            } else if (r->endpoints[i]->router != NULL) {
                
                // Recursive call to check all endpoints of this router
                return http_router_get_match_path_temp(r->endpoints[i]->router, path, test);
                
            }
            
        }
        
        // If current path is same as the path researched try to use the endpoint
        if (strcmp(path,test) == 0) {
            
            // If an event function is attached to the endpoint then return the event function
            if (r->endpoints[i]->event != NULL) {
                
                free(test);
                return r->endpoints[i]->event;
            
            // Else try to check if a router is connected to the endpoint
            } else if (r->endpoints[i]->router != NULL) {
                
                // Recursive call to check all endpoints of this router
                return http_router_get_match_path_temp(r->endpoints[i]->router, path, test);
                
            } else {
                free(test);
            }
        
        // If current path not match with the researched path try to check if a router is connected to the endpoint
        } else if (r->endpoints[i]->router != NULL) {
            
            // Recursive call to check all endpoints of this router
            return http_router_get_match_path_temp(r->endpoints[i]->router, path, test);
            
        } else {
            free(test);
        }
        
        i++;
    }
    
    if (temp != NULL) free(temp);
    
    // If we go here, then no http endpoints match the path researched, so return a NULL pointer
    return NULL;
}


void *(*http_router_get_match_path(HTTP_Router *r, char *path))(struct HTTP_Client*,struct HTTP_Request*) {
    return http_router_get_match_path_temp(r, path, NULL);
}


HTTP_Router* http_router_create(char *path) {
    HTTP_Router* r = (HTTP_Router*)malloc(sizeof(HTTP_Router));
    if (!r) return NULL;
    memset(r, 0, sizeof(HTTP_Router));
    r->path = (char*)malloc((strlen(path)+1)*sizeof(char));
    if (!(r->path)) {
        free(r);
        return NULL;
    }
    r->path[0] = '\0';
    strcat(r->path,path);
    r->endpoints = NULL;
    return r;
}


int http_router_add_endpoint(HTTP_Router *r,HTTP_Endpoint *ep) {
    
    if (r->endpoints == NULL) {
        r->size = 2;
        r->length = 0;
        r->endpoints = (HTTP_Endpoint**)malloc((r->size+1)*sizeof(HTTP_Endpoint*));
        if (!(r->endpoints)) return -1;
    }
    
    if (r->length + 1 >= r->size) {
        r->size *= 2;
        r->endpoints = (HTTP_Endpoint**)realloc(r->endpoints,(r->size+1)*sizeof(HTTP_Endpoint*));
        if (!(r->endpoints)) return -1;
    }
    
    r->endpoints[r->length] = ep;
    (r->length)++;
    r->endpoints[r->length] = NULL;
    
    return 0;
    
}


int http_router_on(HTTP_Router *r, char *path, void *(*event)(struct HTTP_Client*,struct HTTP_Request*)) {
    HTTP_Endpoint* ep = (HTTP_Endpoint*)malloc(sizeof(HTTP_Endpoint));
    if (!ep) return -1;
    memset(ep, 0, sizeof(HTTP_Endpoint));
    ep->path = (char*)malloc((strlen(path)+1)*sizeof(char));
    if (!(ep->path)) {
        free(ep);
        return -1;
    }
    ep->path[0] = '\0';
    strcat(ep->path,path);
    ep->router = NULL;
    if (http_router_add_endpoint(r,ep) < 0) {
        free(ep->path);
        free(ep);
        return -1;
    }
    ep->any_request = 0;
    ep->event = event;
    return 0;
}


int http_router_any(HTTP_Router *r, void *(*event)(struct HTTP_Client*,struct HTTP_Request*)) {
    HTTP_Endpoint* ep = (HTTP_Endpoint*)malloc(sizeof(HTTP_Endpoint));
    if (!ep) return -1;
    memset(ep, 0, sizeof(HTTP_Endpoint));
    ep->path = (char*)malloc(2*sizeof(char));
    if (!(ep->path)) {
        free(ep);
        return -1;
    }
    ep->path[0] = '\0';
    strcat(ep->path,"");
    ep->router = NULL;
    if (http_router_add_endpoint(r,ep) < 0) {
        free(ep->path);
        free(ep);
        return -1;
    }
    ep->any_request = 1;
    ep->event = event;
    return 0;
}


int http_router_attach(HTTP_Router *r, char *path, HTTP_Router *a) {
    HTTP_Endpoint* ep = (HTTP_Endpoint*)malloc(sizeof(HTTP_Endpoint));
    if (!ep) return -1;
    memset(ep, 0, sizeof(HTTP_Endpoint));
    ep->path = (char*)malloc((strlen(path)+1)*sizeof(char));
    if (!(ep->path)) {
        free(ep);
        return -1;
    }
    ep->path[0] = '\0';
    strcat(ep->path,path);
    ep->event = NULL;
    if (http_router_add_endpoint(r,ep) < 0) {
        free(ep->path);
        free(ep);
        return -1;
    }
    ep->any_request = 0;
    ep->router = a;
    return 0;
}










typedef enum HTTP_Method {HTTP_Method_UNSUPPORTED, HTTP_Method_GET, HTTP_Method_POST} HTTP_Method;

typedef struct HTTP_Header {
    char *name;
    char *value;
    struct HTTP_Header *next;
} HTTP_Header;

typedef struct HTTP_Request {
    HTTP_Method method;
    char *path;
    char *version;
    HTTP_Header *headers;
    char *body;
    long int bodylength;
} HTTP_Request;

typedef struct HTTP_Response {
    char *version;
    HTTP_Status status;
    HTTP_Header *headers;
    char *body;
    long int bodylength;
} HTTP_Response;

typedef enum HTTP_Server_State {
    HTTP_ENUM_STATE_NOT_INIT,
    HTTP_ENUM_STATE_INIT,
    HTTP_ENUM_STATE_RUNNING,
    HTTP_ENUM_STATE_STOPPED
} HTTP_Server_State;

typedef struct HTTP_Server {
    struct HTTP_Router *root;
    int port;
    SOCKET socket;
    pthread_t thread;
    HTTP_Server_State state;
    int http_opt; // allow multiple connection at same time on the socket server
} HTTP_Server;

typedef struct HTTP_Client {
    HTTP_Server *server;
    SOCKET socket;
    SOCKADDR_IN socket_addr;
} HTTP_Client;

typedef struct HTTP_Form_Data {
    
    HTTP_Header *headers;
    
} HTTP_Form_Data;



void http_response_date(char *buf, size_t buf_len, struct tm *tm) {
    const char *days[] = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
    const char *months[] = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct", "Nov", "Dec"};

    snprintf(buf, buf_len, "%s, %d %s %d %02d:%02d:%02d GMT",
        days[tm->tm_wday], tm->tm_mday, months[tm->tm_mon],
        tm->tm_year + 1900, tm->tm_hour, tm->tm_min, tm->tm_sec);
}

int http_response_date_now(char *buf, size_t buf_len) {
    time_t now = time(NULL);
    if (now == -1)
        return -1;

    struct tm *tm = gmtime(&now);
    if (tm == NULL)
        return -1;

    http_response_date(buf, buf_len, tm);
    return 0;
}

/**
 * Get Value of Header By Key
 */
char* http_request_get_header_value(HTTP_Request *req, char *key) {
    if (req) {
        HTTP_Header *h;
        for (h=req->headers; h; h=h->next) {
            if (strcmpinsensitive(h->name, key) == 0) return h->value;
        }
    }
    return NULL;
}

/**
 * Free a HTTP Header
 */
void http_header_free(HTTP_Header *h) {
    if (h) {
        if (h->name) free(h->name);
        if (h->value) free(h->value);
        http_header_free(h->next);
        if (h) free(h);
    }
}

/**
 * Free a HTTP Request
 */
void http_request_free(HTTP_Request* req) {
    if (req) {
        if (req->path) free(req->path);
        if (req->version) free(req->version);
        http_header_free(req->headers);
        if (req->body) free(req->body);
        free(req);
    }
}

/**
 * Free a HTTP Response
 */
void http_response_free(HTTP_Response* res) {
    if (res) {
        if (res->version) free(res->version);
        http_header_free(res->headers);
        if (res->body) free(res->body);
        free(res);
    }
}

/**
 * Parse an HTTP Request
 */
HTTP_Request* http_request_parse(const char *raw, long int rawsize) {
    
    long int raw_len = rawsize;
    long int raw_pos = (long int)raw;
    
    HTTP_Request *req = NULL;
    req = malloc(sizeof(struct HTTP_Request));
    if (!req) {
        return NULL;
    }
    memset(req, 0, sizeof(struct HTTP_Request));

    // Method
    size_t meth_len = strcspn(raw, " ");
    if (strncmpinsensitive(raw, "GET", 3) == 0) {
        req->method = HTTP_Method_GET;
    } else if (strncmpinsensitive(raw, "POST", 4) == 0) {
        req->method = HTTP_Method_POST;
    } else {
        req->method = HTTP_Method_UNSUPPORTED;
    }
    raw += meth_len + 1;
    
    
    if ((long int)raw-raw_pos >= raw_len) {
        http_request_free(req);
        return NULL;
    }
    
    // Request-URI
    size_t url_len = strcspn(raw, " ");
    req->path = malloc(url_len + 1);
    if (!req->path) {
        http_request_free(req);
        return NULL;
    }
    memcpy(req->path, raw, url_len);
    req->path[url_len] = '\0';
    raw += url_len + 1; // move past <SP>
    
    if ((long int)raw-raw_pos >= raw_len) {
        http_request_free(req);
        return NULL;
    }
    

    // HTTP-Version
    size_t ver_len = 0;
    while (raw[ver_len] != '\r' && raw[ver_len] != '\n') {
        ver_len++;
        if ((long int)raw-raw_pos+(long int)ver_len >= raw_len) {
            http_request_free(req);
            return NULL;
        }
    }
    req->version = malloc(ver_len + 1);
    if (!req->version) {
        http_request_free(req);
        return NULL;
    }
    memcpy(req->version, raw, ver_len);
    req->version[ver_len] = '\0';
    raw += ver_len; // move past
    if ((long int)raw-raw_pos >= raw_len) {
        http_request_free(req);
        return NULL;
    }
    if (raw[0] == '\r' || raw[0] == '\n') raw++;
    if ((long int)raw-raw_pos >= raw_len) {
        http_request_free(req);
        return NULL;
    }
    if (raw[0] == '\r' || raw[0] == '\n') raw++;
    
    if ((long int)raw-raw_pos >= raw_len) {
        http_request_free(req);
        return NULL;
    }
    
    HTTP_Header *header = NULL, *last = NULL;
    while (1) {
        last = header;
        header = malloc(sizeof *header);
        if (!header) {
            http_request_free(req);
            return NULL;
        }

        // name
        size_t name_len = strcspn(raw, ":");
        header->name = malloc(name_len + 1);
        if (!header->name) {
            http_request_free(req);
            return NULL;
        }
        memcpy(header->name, raw, name_len);
        header->name[name_len] = '\0';
        raw += name_len + 1; // move past :
        if ((long int)raw-raw_pos >= raw_len) {
            http_request_free(req);
            return NULL;
        }
        while (*raw == ' ') {
            raw++;
            if ((long int)raw-raw_pos >= raw_len) {
                http_request_free(req);
                return NULL;
            }
        }

        // value
        size_t value_len = 0;
        while (raw[value_len] != '\r' && raw[value_len] != '\n') {
            value_len++;
            if ((long int)raw-raw_pos+value_len >= raw_len) {
                http_request_free(req);
                return NULL;
            }
        }
        header->value = malloc(value_len + 1);
        if (!header->value) {
            http_request_free(req);
            return NULL;
        }
        memcpy(header->value, raw, value_len);
        header->value[value_len] = '\0';
        raw += value_len; // move
        if ((long int)raw-raw_pos >= raw_len) {
            http_request_free(req);
            return NULL;
        }
        if (raw[0] == '\r' || raw[0] == '\n') raw++;
        if ((long int)raw-raw_pos >= raw_len) {
            http_request_free(req);
            return NULL;
        }
        if (raw[0] == '\r' || raw[0] == '\n') raw++;
        if ((long int)raw-raw_pos >= raw_len) {
            http_request_free(req);
            return NULL;
        }

        // next
        header->next = last;
        
        if (raw[0] == '\r' || raw[0] == '\n') break;
    }
    
    req->headers = header;
    req->bodylength = 0;
    if (raw[0] == '\r' || raw[0] == '\n') raw++;
    if ((long int)raw-raw_pos >= raw_len) {
        req->body = malloc(1);
        req->body[0] = '\0';
        return req;
    }
    if (raw[0] == '\r' || raw[0] == '\n') raw++;
    if ((long int)raw-raw_pos >= raw_len) {
        req->body = malloc(1);
        req->body[0] = '\0';
        return req;
    }
    
    long int body_len = raw_len-((long int)raw-raw_pos);
    req->bodylength = body_len;
    req->body = malloc(body_len + 1);
    if (!req->body) {
        http_request_free(req);
        return NULL;
    }
    memcpy(req->body, raw, body_len);
    req->body[body_len] = '\0';


    return req;
}

/**
 * Print an HTTP Request
 */
void http_request_print(HTTP_Request* req) {
    if (req) {
        printf("Method: %d\n", req->method);
        printf("Request-URI: %s\n", req->path);
        printf("HTTP-Version: %s\n", req->version);
        puts("Headers:");
        HTTP_Header *h;
        for (h=req->headers; h; h=h->next) {
            printf("%32s: %s\n", h->name, h->value);
        }
        puts("message-body:");
        puts(req->body);
    }
}

/**
 * Print an HTTP Response
 */
void http_response_print(HTTP_Response* res) {
    if (res) {
        printf("HTTP-Version: %s\n", res->version);
        puts("Headers:");
        HTTP_Header *h;
        for (h=res->headers; h; h=h->next) {
            printf("%32s: %s\n", h->name, h->value);
        }
        puts("message-body:");
        puts(res->body);
    }
}

/**
 * Add Header to HTTP Response
 */
void http_response_add_header(HTTP_Response* res, char* key, char* value) {
    HTTP_Header* h = malloc(sizeof(HTTP_Header));
    h->name = malloc(strlen(key)+1);
    strcpy(h->name, key);
    h->value = malloc(strlen(value)+1);
    strcpy(h->value, value);
    h->next = NULL;
    HTTP_Header **i = &(res->headers);
    while (*i) i=&((*i)->next);
    *i = h;
}

/**
 * Convert HTTP Response to char*
 */
char* http_response_to_buffer(HTTP_Response* res, long int *outsize) {
    
    int size = 0;
    for (HTTP_Header *h=res->headers; h; h=h->next) {
        size += strlen(h->name) + strlen(h->value) + 4;
    }
    
    char* buffer = malloc(strlen(res->version)+3+2+strlen(res->status.text)+2+size+2+res->bodylength+1    +5000);
    buffer[0] = '\0';
    
    char statuscode[64];
    sprintf(statuscode, "%d", res->status.code);
    
    long int i = 0;
    long int j = 0;
    long int vsize = strlen(res->version);
    while (j < vsize) {
        buffer[i++] = res->version[j++];
    }
    buffer[i++] = ' ';
    j = 0;
    vsize = strlen(statuscode);
    while (j < vsize) {
        buffer[i++] = statuscode[j++];
    }
    buffer[i++] = ' ';
    j = 0;
    vsize = strlen(res->status.text);
    while (j < vsize) {
        buffer[i++] = res->status.text[j++];
    }
    buffer[i++] = '\r';buffer[i++] = '\n';
    j = 0;
    
    for (HTTP_Header *h=res->headers; h; h=h->next) {
        
        j = 0;
        vsize = strlen(h->name);
        while (j < vsize) {
            buffer[i++] = h->name[j++];
        }
        buffer[i++] = ':';buffer[i++] = ' ';
        j = 0;
        vsize = strlen(h->value);
        while (j < vsize) {
            buffer[i++] = h->value[j++];
        }
        buffer[i++] = '\r';buffer[i++] = '\n';
        
    }
    
    buffer[i++] = '\r';buffer[i++] = '\n';
    
    j = 0;
    vsize = res->bodylength;
    while (j < vsize) {
        buffer[i++] = res->body[j++];
    }
    
    *outsize = i;
    
    return buffer;
}

/**
 * Send Buffer to client though HTTP Protocol
 */
int http_response_send_r(HTTP_Client* client, char* buffer, long int bufferlength, char* mimetype, HTTP_Status status) {
    HTTP_Response *res = (HTTP_Response*)malloc(sizeof(HTTP_Response));
    if (!res) {
        return -1;
    }
    memset(res, 0, sizeof(HTTP_Response));
    
    res->version = malloc(9);
    res->version[0] = '\0';
    strcat(res->version,"HTTP/1.1");
    res->status = status;
    res->body = malloc(bufferlength+1);
    res->bodylength = bufferlength;
    long int i = 0;
    while (i < bufferlength) {
        res->body[i] = buffer[i];
        i++;
    }
    res->body[i] = '\0';
    
    char sizebuffer[64];
    sprintf(sizebuffer, "%d", bufferlength);
    
    char date[64];
    http_response_date_now(date, (size_t)64);
    
    http_response_add_header(res, "Date", date);
    http_response_add_header(res, "Server", "Simple Server in C");
    http_response_add_header(res, "Last-Modified", date);
    http_response_add_header(res, "Content-Length", sizebuffer);
    http_response_add_header(res, "Content-Type", mimetype);
    http_response_add_header(res, "Connection", "close");
    
    long int size = 0;
    char *buf = http_response_to_buffer(res,&size);
    
    void* p = (void*)buf;
    
    int r = -1;
    
    if (size <= HTTP_SERVER_BUFFER_SIZE) {
        r = send(client->socket, buf, size, 0);
    } else {
        long int bytestosend = size;
        int sizetosend = HTTP_SERVER_BUFFER_SIZE;
        while ((r = send(client->socket, buf, sizetosend, 0)) > 0) {
            bytestosend -= r;
            buf += r;
            if (bytestosend < HTTP_SERVER_BUFFER_SIZE) sizetosend = bytestosend;
            if (buf >= p+size || bytestosend <= 0) break;
        }
    }
    
    
    
    free(buf);
    http_response_free(res);
    
    return r;
}

/**
 * Send Buffer to client though HTTP Protocol
 */
int http_response_send(HTTP_Client* client, char* buffer, HTTP_Status status) {
    return http_response_send_r(client, buffer, strlen(buffer), "text/html", status);
}


int http_response_send_status(HTTP_Client* client, HTTP_Status status) {
    return http_response_send(client, "", status);
}


int http_response_send_m(HTTP_Client* client, char* buffer, char* mimetype, HTTP_Status status) {
    return http_response_send_r(client, buffer, strlen(buffer), mimetype, status);
}


int http_response_parse_formdata(char *body, long int length) {
    
    /*
    Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryrpLAYWdTvbjGGhTr
    BODY RECEIVE: '------WebKitFormBoundaryrpLAYWdTvbjGGhTr
    Content-Disposition: form-data; name="description"

    du texte
    ------WebKitFormBoundaryrpLAYWdTvbjGGhTr
    Content-Disposition: form-data; name="monFichier"; filename="variation de la constante.txt"
    Content-Type: text/plain

    x' = 2x + 1

    ==========================================================================
    (H) : x' / x = 2

    => ln x - ln x0 = 2t

    => x(t) = C exp(2t)
    ==========================================================================


    ==========================================================================
    (P) : variation de la constance :

    x(t) = C(t) exp(2t)

    x'(t) = C'(t) exp(2t) + 2 * C(t) exp(2t)


    C'(t) exp(2t) + 2 * C(t) exp(2t) - 2 * C(t) exp(2t) - 1 = 0

    C'(t) exp(2t) = 1

    C'(t) = exp(-2t)

    C(t) = -1/2 * exp(-2t)

    x(t) = C(t) exp(2t) = -1/2
    ==========================================================================


    (S) Donc x(t) = c exp(2t) - 1/2
    ------WebKitFormBoundaryrpLAYWdTvbjGGhTr--
    
    */
    
    
    return -1;
}


int http_response_send_file(HTTP_Client* client, char* path, HTTP_Status status) {
    FILE* file = fopen(path, "rb");
    if (!file) return -2;
    
    char *buffer;
    
    fseek(file, 0, SEEK_END);
    long int fileLen=ftell(file);
    fseek(file, 0, SEEK_SET);
                                                                                                                                                                                        
    buffer=(char *)malloc((fileLen+1)*sizeof(char));
    if (!buffer) {
        fclose(file);
        return -1;
    }
    
    fread(buffer, fileLen, 1, file);
    buffer[fileLen] = '\0';
    
    fclose(file);
    
    
    // Get File Extension
    long int pathlength = strlen(path);
    char* ext = (char*)malloc((pathlength+1)*sizeof(char));
    if (!ext) {
        free(buffer);
        return -1;
    }
    ext[0] = '\0';
    long int i = pathlength-1;
    long int j = 0;
    while(i && path[i] != '.') {
        ext[j++] = tolower(path[i]);
        i--;
    }
    if (i) ext[j++] = '.';
    ext[j] = '\0';
    char *extension = (char*)malloc((j+1)*sizeof(char));
    if (!extension) {
        free(ext);
        free(buffer);
        return -1;
    }
    extension[0] = '\0';
    long int k = 0;
    while(j) {
        j--;
        extension[k++] = ext[j];
    }
    extension[k] = '\0';
    
    
    // Try to get Mimetype from extension
    char *mimetype = http_mimetype_get_type(extension);
    int r = -1;
    if (!mimetype) {
        
        // If we can't find a mimetype for this file, we set the mimetype as bytes stream
        r = http_response_send_r(client, buffer, fileLen, "application/octet-stream", status);
        
    } else {
        
        r = http_response_send_r(client, buffer, fileLen, mimetype, status);
        
    }
    
    free(extension);
    free(ext);
    free(buffer);
    
    return r;
}


/**
 * Struct that help to call http_request_process inside other thread
 */
typedef struct http_request_process_args {
    HTTP_Client* client;
    HTTP_Request* req;
} http_request_process_args;

/**
 * Process an HTTP Request
 * @param {http_request_process_args*} ptr
 */
void http_request_process(void *ptr) {
    
    http_request_process_args *args = (http_request_process_args *)ptr;
    
    // Get client
    HTTP_Client* client = args->client;
    
    // Get the request
    HTTP_Request* req = args->req;
    
    // Log request
    printf("[%s] %s %s\n",inet_ntoa(client->socket_addr.sin_addr),req->method==HTTP_Method_GET?"GET":req->method==HTTP_Method_POST?"POST":"undefined",req->path);
    
    char *contenttype = http_request_get_header_value(req, "Content-Type");
    if (contenttype) {
        printf("Content-Type: %s\n",contenttype);
    }
    
    if (req->bodylength) {
        printf("BODY RECEIVE: '%s'\n",req->body);
        
    }
    
    // Get corresponding endpoint inside router's server
    void *(*endpoint_event)(HTTP_Client*,HTTP_Request*) = http_router_get_match_path(client->server->root, req->path);
    
    int handled = 0;
    
    // Check if endpoint exist
    if (endpoint_event != NULL) {
        handled = 1;
        endpoint_event(client,req); // Call endpoint event
    }
    
    // Send 404 Error if File not exist and no router exist
    if (!handled) {
        http_response_send(client, "", HTTP_STATUS_NOT_FOUND);
    }
    
}


static void http_connection_handler(void *ptr) {
    
    // Get Client
    HTTP_Client* client = (HTTP_Client*)ptr;
    
	// Get the socket descriptor
	int sock = client->socket;
	int read_size;
	char *message , client_message[HTTP_SERVER_BUFFER_SIZE];
	
	//message = "Now type something and i shall repeat what you type \n";
	//write(sock , message , strlen(message));
    
    int length = HTTP_SERVER_BUFFER_SIZE;
    long int total = 0;
    char *m = (char *)malloc((length*2) * sizeof(char));
    m[0] = '\0';
    long int m_index = 0;
    
    // We process each different request inside a new thread (adapted to support pipelining http request)
    int sniffer_threads_size = 4;
    int sniffer_use = 0;
    pthread_t* sniffer_threads = (pthread_t*)malloc((sniffer_threads_size+1) * sizeof(pthread_t));
    HTTP_Request** requests = (HTTP_Request**)malloc((sniffer_threads_size+1) * sizeof(HTTP_Request*));
    requests[sniffer_use] = NULL;
    
    // Total data received from client
    long int total_data_received = 0;
    
    int end_request = 0;
    int needtoread = HTTP_SERVER_BUFFER_SIZE-1;
    long int bytestoread = 0;
    int getbody = 0;
	
	// Receive a message from client
	while ((read_size = recv(sock, client_message, needtoread, 0)) > 0) {
        
        client_message[read_size] = '\0';
        
        // Append data receive to a whole buffer
        if (total + read_size + 2 >= length) {
            length *= 2;
            m = (char *)realloc(m, (length+1) * sizeof(char));
        }
        total += read_size;
        int i = 0;
        while (i < read_size) {
            m[m_index] = client_message[i];
            if (m_index > 2 && !end_request) {
                if (m[m_index-3] == '\r' && m[m_index-2] == '\n' && m[m_index-1] == '\r' && m[m_index] == '\n') {
                    end_request = 1;
                    m_index++;
                    i++;
                    break;
                }
            }
            m_index++;
            i++;
        }
        
        // If there are too much data, then abort request (we don't want to fill the ram with lot amount of data)
        if (total > HTTP_SERVER_MAX_BYTES_RECV) {
            
            // Too much data, abort current request
            break;
            
        }
        
        if (bytestoread > 0) {
            bytestoread -= read_size;
            if (bytestoread > HTTP_SERVER_BUFFER_SIZE-1) {
                needtoread = HTTP_SERVER_BUFFER_SIZE-1;
            } else {
                needtoread = bytestoread;
            }
            if (bytestoread > 0) continue;
        }
        
        if (end_request) {
            
            if (requests[sniffer_use] != NULL) {
                http_request_free(requests[sniffer_use]);
            }
                
            // Parse the request
            requests[sniffer_use] = http_request_parse(m,m_index);
                
            // Check if "content-length" header exist, if it exist, then continue to read the bytes
            if (!getbody) {
                char *value = http_request_get_header_value(requests[sniffer_use],"Content-Length");
                if (value) {
                    char* endPtr;
                    long int bytestoreadtemp = strtol(value, &endPtr, 10);
                    if (!(*endPtr)) {
                        if (bytestoreadtemp > 0) {
                            bytestoread = bytestoreadtemp;
                            
                            while (i < read_size && bytestoread > 0) {
                                m[m_index] = client_message[i];
                                m_index++;
                                i++;
                                bytestoread--;
                            }
                            
                            if (bytestoread > 0) {
                                getbody = 1;
                                if (bytestoread > HTTP_SERVER_BUFFER_SIZE-1) {
                                    needtoread = HTTP_SERVER_BUFFER_SIZE-1;
                                } else {
                                    needtoread = bytestoread;
                                }
                                continue;
                            } else {
                                http_request_free(requests[sniffer_use]);
                                requests[sniffer_use] = http_request_parse(m,m_index);
                            }
                        }
                    }
                }
            }
                
            // Build arguments
            struct http_request_process_args args;
            args.client = client;
            args.req = requests[sniffer_use];
                
            // Process request in parallel
            if (pthread_create(&sniffer_threads[sniffer_use], NULL, http_request_process, (void *)&args) < 0) {
                    
                // Error server side, just abort current request
                break;
                    
            }
                
            // Increment index for use new threads
            sniffer_use++;
            requests[sniffer_use] = NULL;
                
            // Reset dynamic buffer
            length = HTTP_SERVER_BUFFER_SIZE;
            total = 0;
            free(m);
            m = (char *)malloc((length+1+read_size) * sizeof(char));
            m[0] = '\0';
            end_request = 0;
            m_index = 0;
            needtoread = HTTP_SERVER_BUFFER_SIZE-1;
            bytestoread = 0;
            getbody = 0;
            while (i < read_size) {
                m[m_index++] = client_message[i];
                i++;
            }
                
            total_data_received += total;
                
            // If there are too much data, then abort request (we don't want to fill the ram with lot amount of data)
            if (total_data_received > HTTP_SERVER_MAX_BYTES_RECV) {
                    
                // Too much data, abort current request
                break;
                    
            }
                
            // reallocate if array too small
            if (sniffer_use >= sniffer_threads_size) {
                sniffer_threads_size *= 2;
                sniffer_threads = (pthread_t*)realloc(sniffer_threads, (sniffer_threads_size+1) * sizeof(pthread_t));
                requests = (HTTP_Request**)realloc(requests, (sniffer_threads_size+1) * sizeof(HTTP_Request*));
                requests[sniffer_use] = NULL;
            }
                
        }
        
        
	}
    
    // Now join all threads
    for (int i = 0; i < sniffer_use; i++) {
        pthread_join(sniffer_threads[i], NULL);
        http_request_free(requests[i]);
    }
    
	
	if(read_size == 0) {
		//puts("Client disconnected");
		//fflush(stdout);
	} else if(read_size == -1) {
        #ifdef WIN32
        if (WSAGetLastError() != WSAETIMEDOUT) {
        //}
        #else
        if ((errno != EAGAIN) && (errno != EWOULDBLOCK)) {
        #endif
            perror("recv failed");
        } else {
            //puts("Client disconnected (timeout)");
            //fflush(stdout);
        }
	}
    
    // Close the socket client
    closesocket(client->socket);
		
    free(requests);        // Free requests array
	free(sniffer_threads); // Free threads array
    free(m);               // Free the dynamic bufer
    free(client);          // Free the client
	
}


static void http_server_init(HTTP_Server *server) {
    SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);
    SOCKADDR_IN sin = {
        0
    };

    if (sock == INVALID_SOCKET) {
        perror("socket()");
        exit(errno);
    }

    sin.sin_addr.s_addr = htonl(INADDR_ANY);
    sin.sin_port = htons(server->port);
    sin.sin_family = AF_INET;
    
    //set master socket to allow multiple connections , this is just a good habit, it will work without this
    if (setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, (char *)&(server->http_opt), sizeof(server->http_opt)) < 0) {
        perror("setsockopt");
        exit(EXIT_FAILURE);
    }
    
    #ifdef WIN32
    DWORD timeout = HTTP_SERVER_TIMEOUT_SECONDS_RCV * 1000;
    if (setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof timeout) < 0) {
        perror("setsockopt");
        exit(EXIT_FAILURE);
    }
    #else
    struct timeval tv;
    tv.tv_sec = HTTP_SERVER_TIMEOUT_SECONDS_RCV;
    tv.tv_usec = 0;
    if (setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, (const char*)&tv, sizeof tv) < 0) {
        perror("setsockopt");
        exit(EXIT_FAILURE);
    }
    #endif

    if (bind(sock, (SOCKADDR * ) & sin, sizeof sin) == SOCKET_ERROR) {
        perror("bind()");
        exit(errno);
    }

    if (listen(sock, MAX_CLIENTS) == SOCKET_ERROR) {
        perror("listen()");
        exit(errno);
    }
    
    server->socket = sock;
    server->state = HTTP_ENUM_STATE_INIT;
}


static void http_server_loop(void *ptr) {
    HTTP_Server *server = (HTTP_Server *)ptr;
    
    SOCKET sock = server->socket;
    
    server->state = HTTP_ENUM_STATE_RUNNING;
    
    SOCKET client_sock , c;
	SOCKADDR_IN client;
    
    c = sizeof(SOCKADDR_IN);
    
    while((client_sock = accept(sock, (SOCKADDR *)&client, (size_t*)&c))) {
        
        // If state of server is stopped: stop the loop
        if (server->state != HTTP_ENUM_STATE_RUNNING) return;
        
		//puts("Connection accepted");
		
		pthread_t sniffer_thread;
        
        HTTP_Client* http_client = (HTTP_Client*)malloc(sizeof(HTTP_Client));
        if (!http_client) continue;
        memset(http_client, 0, sizeof(HTTP_Client));
        
        http_client->socket = client_sock;
        http_client->server = server;
        http_client->socket_addr = client;
		
		if (pthread_create(&sniffer_thread, NULL, http_connection_handler, (void*)http_client) < 0) {
			perror("could not create thread");
			exit(1);
		}
		
		//Now join the thread , so that we dont terminate before the thread
		//pthread_join(sniffer_thread , NULL);
		//puts("Handler assigned");
	}
	
	if (client_sock < 0) {
		perror("accept failed");
		exit(2);
	}
}


void http_server_run(HTTP_Server *server, int port) {
    server->port = port;
    
    if (server->state == HTTP_ENUM_STATE_NOT_INIT) http_server_init(server);
		
    if (pthread_create(&(server->thread), NULL, http_server_loop, (void*)server) < 0) {
        perror("could not create thread");
        exit(1);
    }
}


void http_server_join(HTTP_Server *server) {
    pthread_join(server->thread, NULL);
}


HTTP_Server* http_server_create() {
    HTTP_Server* server = (HTTP_Server*)malloc(sizeof(HTTP_Server));
    if (!server) return NULL;
    memset(server, 0, sizeof(HTTP_Server));
    server->port = HTTP_SERVER_PORT;
    server->state = HTTP_ENUM_STATE_NOT_INIT;
    server->root = http_router_create("");
    server->http_opt = 1;
    if (!(server->root)) {
        free(server);
        return NULL;
    }
    return server;
}






static void websocket_handle_conn(SOCKET sock, char *buffer) {
 
    /*if (!http_header_is_exist_key("Sec-WebSocket-Key", buffer)) {
        perror("unable to handle websocket connection : Sec-WebSocket-Key is undefined\n");
        return;
    }
 
    char *socket_key;
    http_header_parse("Sec-WebSocket-Key", buffer, &socket_key);
    
    uint8_t digest[1024];
    char hexdigest[1024];
    
    char *data = (char *)malloc(strlen(socket_key)+37 * sizeof(char));
    data[0] = '\0';
    strcat(data, socket_key);
    strcat(data, "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
    

    int r = sha1digest(digest, (uint8_t *)hexdigest, (uint8_t *)data, strlen(data));
    
    char *socket_accept = hex_2_base64(hexdigest);
    
    printf("'%s'\n",socket_key);
    printf("'%s'\n",socket_accept);

    free(data);
    free(socket_accept);
    free(socket_key);*/
 
}




/*
 * This will handle connection for each client
 * *//*
static void connection_handler(void *socket_desc) {
    
	// Get the socket descriptor
	int sock = *(int*)socket_desc;
	int read_size;
	char *message , client_message[HTTP_SERVER_BUFFER_SIZE];
	
	//message = "Now type something and i shall repeat what you type \n";
	//write(sock , message , strlen(message));
    
    int length = HTTP_SERVER_BUFFER_SIZE;
    int total = 0;
    char *m = (char *)malloc((length+1) * sizeof(char));
    m[0] = '\0';
    
    // We process each different request inside a new thread (adapted to support pipelining http request)
    int sniffer_threads_size = 4;
    int sniffer_use = 0;
    pthread_t* sniffer_threads = (pthread_t*)malloc((sniffer_threads_size+1) * sizeof(pthread_t));
    HTTP_Request** requests = (HTTP_Request**)malloc((sniffer_threads_size+1) * sizeof(HTTP_Request*));
    
    // Total data received from client
    int total_data_received = 0;
	
	// Receive a message from client
	while ((read_size = recv(sock, client_message, length, 0)) > 0) {
        
        // Append data receive to a whole buffer
        strcat(m,client_message);
        if (total + read_size + 2 >= length) {
            length *= 2;
            m = (char *)realloc(m, (length + 1) * sizeof(char));
        }
        total += read_size;
        
        // If there are too much data, then abort request (we don't want to fill the ram with lot amount of data)
        if (total > HTTP_SERVER_MAX_BYTES_RECV) {
            
            // Too much data, abort current request
            break;
            
        }
        
        // Detect end of the client request
        if (total > 2) {
            if (m[total-4] == '\r' && m[total-3] == '\n' && m[total-2] == '\r' && m[total-1] == '\n') {
                
                m[total] = '\0'; // End correctly the buffer string
                
                // Parse the request
                requests[sniffer_use] = http_request_parse(m);
                
                // Build arguments
                struct http_request_process_args args;
                args.socket_desc = socket_desc;
                args.req = requests[sniffer_use];
                
                // Process request in parallel
                if (pthread_create(&sniffer_threads[sniffer_use], NULL, http_request_process, (void *)&args) < 0) {
                    
                    // Error server side, just abort current request
                    break;
                    
                }
                
                // Increment index for use new threads
                sniffer_use++;
                
                // Reset dynamic buffer
                length = HTTP_SERVER_BUFFER_SIZE;
                total = 0;
                free(m);
                m = (char *)malloc((length+1) * sizeof(char));
                m[0] = '\0';
                
                total_data_received += total;
                
                // If there are too much data, then abort request (we don't want to fill the ram with lot amount of data)
                if (total_data_received > HTTP_SERVER_MAX_BYTES_RECV) {
                    
                    // Too much data, abort current request
                    break;
                    
                }
                
                // reallocate if array too small
                if (sniffer_use >= sniffer_threads_size) {
                    sniffer_threads_size *= 2;
                    sniffer_threads = (pthread_t*)realloc(sniffer_threads, (sniffer_threads_size+1) * sizeof(pthread_t));
                    requests = (HTTP_Request**)realloc(requests, (sniffer_threads_size+1) * sizeof(HTTP_Request*));
                }
                
            }
        }
        
	}
    
    // Now join all threads
    for (int i = 0; i < sniffer_use; i++) {
        pthread_join(sniffer_threads[i], NULL);
        http_request_free(requests[i]);
    }
    
	
	if(read_size == 0) {
		puts("Client disconnected");
		fflush(stdout);
	} else if(read_size == -1) {
        #ifdef WIN32
        if (WSAGetLastError() != WSAETIMEDOUT) {
        //}
        #else
        if ((errno != EAGAIN) && (errno != EWOULDBLOCK)) {
        #endif
            perror("recv failed");
        } else {
            puts("Client disconnected (timeout)");
            fflush(stdout);
        }
	}
		
    free(requests);        // Free requests array
	free(sniffer_threads); // Free threads array
	free(socket_desc);     // Free the socket pointer
    free(m);               // Free the dynamic bufer
	
}
*/
/**********************\
*                      *
*         MAIN         *
*                      *
\**********************/



// TODO:
// add support to POST method (full support)
// add other method support
// add support to query parameter
// modify endpoint to support method redirection

// THEN ONLY -> finish to implement socket
// AND FINALLY -> create a little slither.io game

// MAYBE (.....) -> implement HTTP/2.0 (only handle h2 upgrade and then enable stream bytes communication (like websocket))

int main(int argc, char * argv[]) {
    
    char *req =
    "salut=lol&wesh=&gutentag=45&lastg=trop bien";
    
    //while(1){
    HTTP_Tree* t = http_parser(req, strlen(req), '&', '=');
    if (t!=NULL) {
        printf("OK================================\n");
        int len = http_tree_length(t);
        printf("length=%d\n",len);
        HTTP_Node** listtemp = (HTTP_Node**)malloc(len*sizeof(HTTP_Node*));
        int j = 0;
        if (http_tree_infix(t, listtemp, &j) == 0) {
            for (int k = 0; k < j; k++) {
                printf("'%s'='%s'\n",listtemp[k]->key,(char*)listtemp[k]->data);
                http_node_free(listtemp[k]);
            }
        } else {
            printf("an error as occured :'(\n");
        }
        free(listtemp);
        http_tree_free_all(t);
        
        printf("END================================\n");
    }
    //}
    
    
    //while(1){
    //http_mimetype_list_init();
    
    //printf("Type of .html: %s\n",http_mimetype_get_type(".exe"));
    
    //http_mimetype_list_end();
    //}
    
    /*
    //while(1){
    HTTP_Tree* t = http_tree_create();
    
    int life = 42;
    
    HTTP_Node* a = http_node_create("a",(void*)&life);
    HTTP_Node* b = http_node_create("b",(void*)&life);
    HTTP_Node* c = http_node_create("c",(void*)&life);
    HTTP_Node* d = http_node_create("d",(void*)&life);
    HTTP_Node* e = http_node_create("e",(void*)&life);
    HTTP_Node* f = http_node_create("f",(void*)&life);
    HTTP_Node* g = http_node_create("g",(void*)&life);
    HTTP_Node* h = http_node_create("h",(void*)&life);
    
    http_tree_insert(t,e);
    http_tree_insert(t,a);
    http_tree_insert(t,g);
    http_tree_insert(t,f);
    http_tree_insert(t,d);
    http_tree_insert(t,h);
    http_tree_insert(t,b);
    http_tree_insert(t,c);
    
    printf("WIDTH OF TREE: %d\n",http_tree_width(t));
    printf("HEIGHT OF TREE: %d\n",http_tree_height(t));
    printf("LENGTH OF TREE: %d\n",http_tree_length(t));
    
    //http_tree_remove(t,g);
    
    http_tree_compact(t);
    
    printf("\nAFTER REMOVE G:\n");
    
    printf("WIDTH OF TREE: %d\n",http_tree_width(t));
    printf("HEIGHT OF TREE: %d\n",http_tree_height(t));
    printf("LENGTH OF TREE: %d\n",http_tree_length(t));
    
    printf("==========================================\n");
    http_tree_print(t);
    printf("==========================================\n");
    
    printf("VALUE OF E: %d\n",*(int*)http_tree_get(t,"e")->data);
    
    http_node_free(a);
    http_node_free(b);
    http_node_free(c);
    http_node_free(d);
    http_node_free(e);
    http_node_free(f);
    http_node_free(g);
    http_node_free(h);
    http_tree_free(t);
    //}
    */
    
    /*char *res =
    "HTTP/1.1 101 Switching Protocols\n"
    "Upgrade: websocket\n"
    "Connection: Upgrade\n"
    "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\n"
    "\n";*/
    
    
    /*char *req =
    "GET /chat HTTP/1.1\n"
    "Host: exemple.com:8000\n"
    "Upgrade: websocket\n"
    "Connection: Upgrade\n"
    "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\n"
    "Sec-WebSocket-Version: 13\n\n";*/
    
    //while (1) websocket_handle_conn(0, req);





    char *raw_request = "GET / HTTP/1.1\r\n"
            "Host: localhost:8080\r\n"
            "Connection: keep-alive\r\n"
            "Upgrade-Insecure-Requests: 1\r\n"
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n"
            "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0.3 Safari/604.5.6\r\n"
            "Accept-Language: en-us\r\n"
            "DNT: 1\r\n"
            "Accept-Encoding: gzip, deflate\r\n"
            "\r\n"
            "Usually GET requests don\'t have a body\r\n"
            "But I don\'t care in this case :)";
    
    //HTTP_Request *req = http_request_parse(raw_request);
    //http_request_print(req);

    //char *value = http_request_get_header_value(req,"Connection");
    //if (value) printf("Conn: '%s'\n",value);
    
    //HTTP_Router r = {"/"};
    
    //http_server_enable_websocket(&server);
    //http_server_disable_websocket(&server);
    
    /*http_server_on_request(&server, NULL, _(HTTP_Request *req) {
        
        printf("HTTP GET /\n");
        
    });
    
    http_websocketserver_on_message(&server, NULL, NULL, LAMBDA(void _(HTTP_Client** clients, HTTP_Client* client, char *message) {
        
        printf("websocket message!\n");
        
        http_websocketserver_emit(client, "salut ma poule");
        
    });*/
    
    // Init mimetype list
    http_mimetype_list_init();
    
    // Init socket use
    init();
    
    // Create a new HTTP Server
    HTTP_Server* server = http_server_create();
    

    
    // Add an event listener (this event is called each time a client request the corresponding endpoint)
    http_router_on(server->root, "/", LAMBDA(void _(HTTP_Client* client, HTTP_Request* req) {
        
        //http_response_send(client, "<link rel=\"icon\" href=\"favicon.ico\" /><b>hello world from router</b><form method=\"post\" action=\"/postdata\"><input type=\"text\" name=\"username\" placeholder=\"your nickname\"/><input type=\"password\" name=\"password\" placeholder=\"your password\"/><button type=\"submit\">submit</button></form>", HTTP_STATUS_OK);
        
        http_response_send_file(client, "client.html", HTTP_STATUS_OK);
        
    }));
    
    // Add an event listener for send favicon
    http_router_on(server->root, "/favicon.ico", LAMBDA(void _(HTTP_Client* client, HTTP_Request* req) {
        
        http_response_send_file(client, "favicon.ico", HTTP_STATUS_OK);
        
    }));
    
    
    
    // Add an event listener for send favicon
    http_router_on(server->root, "/postdata", LAMBDA(void _(HTTP_Client* client, HTTP_Request* req) {
        
        http_response_send(client, "<b>your data are posted</b>", HTTP_STATUS_OK);
        
    }));
    
    
    
    // Add an event listener (this event is called each time a client request the corresponding endpoint)
    http_router_any(server->root, LAMBDA(void _(HTTP_Client* client, HTTP_Request* req) {
        
        http_response_send(client, "<b>hello world from wildcard</b>", HTTP_STATUS_OK);
        
    }));
    
    
    
    
    ///////////////////////////////////////////////
    
    
    /*HTTP_Router* my_router = http_router_create("/salut");
    http_router_on(my_router, "/bonjour", LAMBDA(void _(HTTP_Client* client, HTTP_Request* req) {
        printf("router /salut -> /salut/bonjour\n");
    }));
    http_router_on(my_router, "/aurevoir", LAMBDA(void _(HTTP_Client* client, HTTP_Request* req) {
        printf("router /salut -> /salut/aurevoir\n");
    }));
    
    http_router_attach(server->root, "", my_router);*/
    
    
    ///////////////////////////////////////////////
    

    // Then Start the HTTP Server with default port
    http_server_run(server, HTTP_SERVER_PORT);
    
    /*http_server_on_request(&server, NULL, _(HTTP_Request *req) {
        
        printf("HTTP GET /\n");
        
    });*/

    //app();
    
    // Join thread server to main thread
    http_server_join(server);

    // End socket use
    end();
    
    return 0;
}
