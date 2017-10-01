// Quinton Ashley
import java.awt.Toolkit; //0
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.StringSelection;
import java.awt.datatransfer.Transferable;
import java.awt.datatransfer.UnsupportedFlavorException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

//import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaCompiler.CompilationTask;
import javax.tools.JavaFileObject;
import javax.tools.JavaFileObject.Kind;

import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

import processing.core.*;
import processing.event.MouseEvent;
//1
/**
 * RuntimeCompilerProcessing is an example class that uses stackoverflow 
 * user Marco13's RuntimeCompiler utility class to plot user inputed 
 * parametric equations in Processing!
 * <br><br>
 * This example is intended for Java/Processing programmers who already
 * have an advanced knowledge of data structures, classes in Java,
 * Processing methods and variables, and Exceptions.
 */
public class Hello extends PApplet {
  boolean leftPressed = false;
  boolean rightPressed = false;
  boolean commandPressed = false;
  boolean altPressed = false;
  boolean userMouseVisible = true;
  int sidebarWidth; //5
  int consoleHeight; //5
  char userWrite = 'x';
  int responseType = 0;
  Console console; //5
  
  Map<String, Method> methods = new LinkedHashMap<String, Method>();
  RuntimeCompiler r = new RuntimeCompiler();
  ParametricPlotter para;

  public static void main(String[] args) { //2
    PApplet.main("Hello");
  }

  public void settings() { //3
    fullScreen();
    size(3840, 2160, P2D);
    pixelDensity(displayDensity());
  }

  public void setup() {//5
	  frameRate(60);
    surface.setTitle("Runtime Compiler Processing Example by Quinton Ashley");
    surface.setResizable(true);
    surface.setSize(displayWidth, displayHeight);
    sidebarWidth = (int) (height/2.8125);
    consoleHeight = height/4;
    // creates a new Console with 13 lines
    console = new Console(sidebarWidth, consoleHeight, 13);
    console.println(
        
        "Runtime Compiler Example by Quinton Ashley \n"+
        "click here on this console to write a \n"+
        "parametric equation \n"+
        "click elsewhere to show/hide this console \n"+
        "right click to switch between x/y equations \n"+
        "scroll to adjust the radius \n\n"+
        
        "use 'X' for the angle and 'R' for radius \n"+
        "type Math functions in lowercase letters \n"+
        "example of equation input: \n"+
        "$ cos(X) * R  \n"

    );
    // creates the default ParametricPlotter //6
    para = new ParametricPlotter();
    noStroke();
  }//5

  public void draw() {
    // arrow keys provide fine grain control of the radius
    if (leftPressed) {
      para.radius -= 0.01;
      para.createPositions();
    } else if (rightPressed) {
      para.radius += 0.01;
      para.createPositions();
    }
    background(0);
    pushMatrix();
    translate(width/2, height/2);
    para.draw();
    popMatrix();
    console.draw();
  }

  class ParametricPlotter { //6
    public short posYAngle = 270;
    public double radius = width/4;
    public String eqPosX = null;
    public String eqPosY = null;
    public float[] positionsX;
    public float[] positionsY;

    public ParametricPlotter() {
      createPositions();
    }

    /**
     * This method should be called every frame in Processing's draw() method.
     * If eqPosY is null, the inverse of the eqPosX equation is used.
     */
    public void draw() {
      for (int i = 0; i < 360; i++) {
        if (eqPosY == null) {
          g.rect(positionsX[ (i)%360 ], positionsX[ (i+posYAngle)%360 ], width/500, width/500);
        } else {
          g.rect(positionsX[ (i)%360 ], positionsY[ (i+posYAngle)%360 ], width/500, width/500);
        }
      }
    }

    /**
     * Calls both create position methods.
     */
    public void createPositions() {
      createPositionsX(eqPosX);
      createPositionsY(eqPosY);
    }

    /**
     * Upon successful completion this method will update positionsX with new positions.
     * @param equation may be valid or invalid and is checked by this method
     */
    public void createPositionsX(String equation) {
      // checks to see if an equation was entered
      if (equation != null && equation.equals(" ")) {
        equation = null;
      }
      // if not the default equation is used
      String eq = (equation == null)?"cos(X)*R":equation;
      // equation is converted into a class name
      String className = equationToClassName(eq);
      // if the class is not found in the methods Map...
      if (methods.get(className) == null) {
        // ...then it will be put in the Map, unless the equation is invalid
        methods.putIfAbsent(className, calculator(className, equationToJava(eq)));
        if (methods.get(className) == null) {
          console.println("invalid x postion equation "+eq);
          return;
        }
      } // ...else the class is already stored in the methods Map
      try { // invoke the method with radius
        positionsX = ((float[]) methods.get(className).invoke(null,(Double) radius));
        // if the positions are successfully created the equation is saved
        // for calls that just change the radius
        eqPosX = equation;
      } catch (Exception e) {
        console.println("fatal error creating x position");
        exit();
      }
    }

    /**
     * Upon successful completion this method will update positionsY with new positions or
     * will do nothing if the equation given is null or " ".
     * @param equation may be valid or invalid and is checked by this method
     */
    public void createPositionsY(String equation) {
      if (equation != null && !equation.equals(" ")) {
        String className = equationToClassName(equation);
        if (methods.get(className) == null) {
          methods.putIfAbsent(className, calculator(className, equationToJava(equation)));
          if (methods.get(className) == null) {
            console.println("invalid y postion equation "+equation);
            return;
          }
        }
        try {
          positionsY = ((float[]) methods.get(className).invoke(null, (Double) radius));
          eqPosY = equation;
        } catch (Exception e) {
          console.println("fatal error creating y position");
          exit();
        }
      } else {
        eqPosY = null;
      }
    }

    /**
     * This method uses the RuntimeCompiler r to create a new class, compile it, and 
     * return it.
     * 
     * @param name is the class name
     * @param equation is the Java code equation String to be used
     * @return the method created
     */
    private Method calculator(String name, String equation) {
      r.addClass(name, 
          "public class " + name + " { \n" + 
              "public static float[] calc(Double R) { \n" + 
              "  float[] positions = new float[360]; \n" + 
              "  for (double X = 0; X < 360; X++) { \n" + 
              "    positions[((int)X)] = (float) ( " + equation + " ); \n" +
              "  } \n" + 
              "  return positions; \n" + 
              "} \n" +
          "} \n");
      r.compile();

      return MethodInvocationUtils.findMethod(
          (Class<?>) r.getCompiledClass(name),
          "calc",
          (Double) radius);
    }
    
    /**
     * Changes all of the properties of this object to the properties given
     * in the string.
     * @param codeFull contains all the properties of a ParametricPlotter object
     *    in a colon ':' separated String.
     */
    public void buildFromCode(String codeFull) {
      try {
        console.println(codeFull);
        String[] code = codeFull.substring(1).split(":");
        radius = Double.parseDouble(code[0]);
        eqPosX = code[1];
        eqPosY = code[2];
        createPositions();
      } catch (Exception e) {
        console.println("creation failure");
      }
    }
    
    @Override
    public String toString() {
      return String.format(":%f:%s:%s:", 
          radius, (eqPosX == null)?" ":eqPosX, (eqPosY == null)?" ":eqPosY);
    }
  }
//7
  /**
   * Converts a user inputed equation to an equivalent equation in Java code.
   * @param equation is a user inputed equation
   * @return an equivalent equation in Java code
   */
  private static String equationToJava(String equation) {
    return equation.replaceAll("cos", "Math.cos")
        .replaceAll("sin", "Math.sin")
        .replaceAll("tan", "Math.tan")
        .replaceAll("acos", "Math.acos")
        .replaceAll("asin", "Math.asin")
        .replaceAll("atan", "Math.atan")
        .replaceAll("abs", "Math.abs")
        .replaceAll("log", "Math.log")
        .replaceAll("log10", "Math.log10")
        .replaceAll("sqrt", "Math.sqrt")
        .replaceAll("cbrt", "Math.cbrt")
        .replaceAll("exp", "Math.exp")
        .replaceAll("pow", "Math.pow")
        .replaceAll("deg", "Math.toDegrees")
        .replaceAll("R", "((double) R)")
        .replaceAll("rad", "Math.toRadians")
        .replaceAll("E", "Math.E")
        .replaceAll("PI", "Math.PI")
        .replaceAll("X", "Math.toRadians(X)")
        .replace('\\', ' ') //
        .replace(':', ' ')  //
        .replace('?', ' ')  // these chars are removed to prevent user hacking
        .replace('"', ' ')  //
        .replace(';', ' '); // 
  }

  /**
   * Converts the user inputed String to a unique Java class name by replacing non-letter
   * characters with capital letters.
   * @param equation is the user inputed equation
   * @return a unique Java class name based on the equation
   */
  private static String equationToClassName(String equation) {
    // a unique Java class name is made by consistently replacing arithmetic and 
    // non-number/non-letter characters with reserved capital letters
    return equation.replaceAll("Math.", "")
        .replaceAll(" ", "")
        .replace('.', 'Z')
        .replace('+', 'A')
        .replace('-', 'S')
        .replace('*', 'T')
        .replace('/', 'D')
        .replace('%', 'M')
        .replace('?', 'Q')
        .replace(':', 'C')
        .replace('(', 'F')
        .replace(')', 'B');
  }
  
  public void mousePressed() {
    if (mouseButton == LEFT) {
      if (!console.visible || mouseX > sidebarWidth) {
        response('c');
      }else if (mouseX < sidebarWidth && responseType == 0) {
        response('w');
      }
    } else if (mouseButton == RIGHT) {
      userWrite = (userWrite=='x')?'y':'x';
      console.println(userWrite + " selected");
    }
  }

  public void mouseWheel(MouseEvent event) {
    double x = (double) ((4.0*event.getCount()));
    
    // Adjusts the radius via scrolling by making use of the characteristics
    // of a y=x^3 shaped function to provide both relatively fine grain
    // and coarse control of the radius from linear event.getCount() output.
    para.radius += Math.pow(Math.abs(x), 1.4) / ((x >= 0)?4:-4);
    para.createPositions();
  }

  public void keyPressed() {
    response(key);
  }
  
  /**
   * Handles keyPressed responses and internal calls with chars.
   * @param key is a command
   */
  public void response(char key) {
    if (key == CODED && keyCode == ALT) {
      altPressed = true;
    } else if (altPressed && key != CODED) {
      altPressed = false;
      switch (key) {
      case 'w': response('∑'); break;
      
      default: break;
      }
    } else if (responseType == 0) {
      if (key == CODED) {
        if (keyCode == LEFT) {
          leftPressed = true;
        } else if (keyCode == RIGHT) {
          rightPressed = true;
        } else if (keyCode == 157) { // 157 is the command key's value
          commandPressed = true;
        }
      } else if (!commandPressed) {
        switch (key) {
        case 'x': case 'y':
          userWrite = key;
          console.println("edit the "+userWrite+" position equation");
          break;
        case 'w':
          console.print("$ ");
          responseType = 1;
          break;
        case '∑':
          userWrite = key;
          console.println("edit all with this format :radius:eqPosX:eqPosY:");
          break;
        case 'p':
          userPrint();
          break;
        case 'm': 
          userMouseVisible = ! userMouseVisible;
          if (userMouseVisible) {
            cursor();
          } else {
            noCursor();
          }
          break;
        case 'c':
          console.visible = !console.visible;
          break;
          
        default:
          break;
        }
      } else {
        switch (key) {
        case 'c':
          console.copyToClipboard(para.toString());
          console.println("para copied to clipboard");
          break;
        case 'v':
          char temp = userWrite;
          userWrite = '∑';
          userAssign(console.getTextFromClipboard());
          userWrite = temp;
          break;

        default: console.println("invalid command"); break;
        }
      }
    } else if (responseType == 1) {
      if (key == CODED) {
        if (keyCode == UP) {
          console.upArrow();
        } else if (keyCode == DOWN) {
          console.downArrow();
        } else if (keyCode == 157) { // 157 is the command key's value
          commandPressed = true;
        }
      } else if (key == ENTER) {
        console.println(console.input);
        userAssign(console.input);
        console.enter();
        
        responseType = 0;
      } else if (key == 8) {
        console.delete();
      } else if (!commandPressed) {
        console.input += key;
      } else if (key == 'v') {
        String text = console.getTextFromClipboard();
        console.input += text;
      }
    } 
  }
  
  public void keyReleased() {
    if (key == CODED) {
      if (keyCode == LEFT) {
        leftPressed = false;
      } else if (keyCode == RIGHT) {
        rightPressed = false;
      } else if (keyCode == 157) { // 157 is the command key's value
        commandPressed = false;
      }
    }
  }

  /**
   * Assigns values to parameters designated by userWrite.
   * @param value is the value in String form to be assigned
   */
  public void userAssign(String value) {
    switch (userWrite) {
    case 'x': case 'y': {
      String temp = value.replaceAll(" ", "");
      if (temp.equals("")) {
        temp = null;
      }
      if (userWrite == 'x') {
        para.createPositionsX(temp); 
      } else {
        para.createPositionsY(temp);
      }
    }break;
    case '∑': para.buildFromCode(value); break;
    
    default:
      break;
    }
  }
  
  /**
   * Prints the parameters of userWrite.
   */
  public void userPrint() {
    switch (userWrite) {
    case 'x': console.println( (para.eqPosX != null)?para.eqPosX:"cos(X)*R" ); break;
    case 'y': console.println( (para.eqPosY != null)?para.eqPosY:"cos(X)*R"); break;
    case '∑': console.println(para.toString()); break;
    
    default:
      break;
    }
  }

  /**
   * Utility class for compiling classes whose source code is given as
   * strings, in-memory, at runtime, using the JavaCompiler tools.
   * <br><br>
   * This class was not authored by Quinton Ashley 
   * but has been edited for use in this application.
   * The unaltered source of this code by stackoverflow 
   * user Marco13 can be found at:
   * <a href="http://stackoverflow.com/a/30038318/3792062">
   * http://stackoverflow.com/a/30038318/3792062</a>
   */
  static class RuntimeCompiler {
    /** The Java Compiler */
    private final JavaCompiler javaCompiler;

    /** The mapping from fully qualified class names to the class data */
    private final Map<String, byte[]> classData;

    /** A class loader that will look up classes in the {@link #classData} */
    private final MapClassLoader mapClassLoader;

    /**
     * The JavaFileManager that will handle the compiled classes, and
     * eventually put them into the {@link #classData}
     */
    private final ClassDataFileManager classDataFileManager;

    /** The compilation units for the next compilation task */
    private final List<JavaFileObject> compilationUnits;

    /**
     * Creates a new RuntimeCompiler
     * 
     * @throws NullPointerException If no JavaCompiler could be obtained.
     * This is the case when the application was not started with a JDK,
     * but only with a JRE. (More specifically: When the JDK tools are 
     * not in the classpath).
     */
    public RuntimeCompiler() {
      this.javaCompiler = ToolProvider.getSystemJavaCompiler();
      if (javaCompiler == null) {
        throw new NullPointerException(
            "No JavaCompiler found. Make sure to run this with "
                + "a JDK, and not only with a JRE");
      }
      this.classData = new LinkedHashMap<String, byte[]>();
      this.mapClassLoader = new MapClassLoader();
      this.classDataFileManager =
          new ClassDataFileManager(
              javaCompiler.getStandardFileManager(null, null, null));
      this.compilationUnits = new ArrayList<JavaFileObject>();
    }

    /**
     * Add a class with the given name and source code to be compiled
     * with the next call to {@link #compile()}
     * 
     * @param className The class name
     * @param code The code of the class
     */
    public void addClass(String className, String code) {
      String javaFileName = className + ".java";
      JavaFileObject javaFileObject =
          new MemoryJavaSourceFileObject(javaFileName, code);
      compilationUnits.add(javaFileObject);
    }

    /**
     * Compile all classes that have been added by calling 
     * {@link #addClass(String, String)}
     * 
     * @return Whether the compilation succeeded
     */
    boolean compile() {
      DiagnosticCollector<JavaFileObject> diagnosticsCollector =
          new DiagnosticCollector<JavaFileObject>();
      CompilationTask task =
          javaCompiler.getTask(null, classDataFileManager,
              diagnosticsCollector, null, null, 
              compilationUnits);
      boolean success = task.call();
      compilationUnits.clear();
      //			for (Diagnostic<?> diagnostic : diagnosticsCollector.getDiagnostics()) {
      //				System.out.println(
      //						diagnostic.getKind() + " : " + 
      //								diagnostic.getMessage(null));
      //				System.out.println(
      //						"Line " + diagnostic.getLineNumber() + 
      //						" of " + diagnostic.getSource());
      //				System.out.println();
      //			}
      return success;
    }

    /**
     * Obtain a class that was previously compiled by adding it with
     * {@link #addClass(String, String)} and calling {@link #compile()}. 
     * 
     * @param className The class name
     * @return The class. Returns <code>null</code> if the compilation failed.
     */
    public Class<?> getCompiledClass(String className) {
      return mapClassLoader.findClass(className);
    }

    /** In-memory representation of a source JavaFileObject */
    private static final class MemoryJavaSourceFileObject extends SimpleJavaFileObject {
      /** The source code of the class */
      private final String code;

      /**
       * Creates a new in-memory representation of a Java file
       * 
       * @param fileName The file name
       * @param code The source code of the file
       */
      private MemoryJavaSourceFileObject(String fileName, String code) {
        super(URI.create("string:///" + fileName), Kind.SOURCE);
        this.code = code;
      }

      @Override
      public CharSequence getCharContent(boolean ignoreEncodingErrors) throws IOException {
        return code;
      }
    }

    /** A class loader that will look up classes in the {@link #classData} */
    private class MapClassLoader extends ClassLoader {
      @Override
      public Class<?> findClass(String name) {
        try {
          byte[] b = classData.get(name);
          return defineClass(name, b, 0, b.length);
        } catch (Exception e) { }
        return null;
      }
    }

    /**
     * In-memory representation of a class JavaFileObject
     * @author User
     */
    private class MemoryJavaClassFileObject extends SimpleJavaFileObject {
      /** The name of the class represented by the file object */
      private final String className;

      /**
       * Create a new java file object that represents the specified class
       * 
       * @param className THe name of the class
       */
      private MemoryJavaClassFileObject(String className) {
        super(URI.create("string:///" + className + ".class"), 
            Kind.CLASS);
        this.className = className;
      }

      @Override
      public OutputStream openOutputStream() throws IOException {
        return new ClassDataOutputStream(className);
      }
    }

    /**
     * A JavaFileManager that manages the compiled classes by passing
     * them to the {@link #classData} map via a ClassDataOutputStream
     */
    private class ClassDataFileManager extends
    ForwardingJavaFileManager<StandardJavaFileManager> {
      /**
       * Create a new file manager that delegates to the given file manager
       * 
       * @param standardJavaFileManager The delegate file manager
       */
      private ClassDataFileManager(
          StandardJavaFileManager standardJavaFileManager) {
        super(standardJavaFileManager);
      }

      @Override
      public JavaFileObject getJavaFileForOutput(final Location location,
          final String className, Kind kind, FileObject sibling)
              throws IOException {
        return new MemoryJavaClassFileObject(className);
      }
    }

    /**
     * An output stream that is used by the ClassDataFileManager
     * to store the compiled classes in the  {@link #classData} map
     */
    private class ClassDataOutputStream extends OutputStream {
      /** The name of the class that the received class data represents */
      private final String className;

      /** The output stream that will receive the class data */
      private final ByteArrayOutputStream baos;

      /**
       * Creates a new output stream that will store the class
       * data for the class with the given name
       * 
       * @param className The class name
       */
      private ClassDataOutputStream(String className) {
        this.className = className;
        this.baos = new ByteArrayOutputStream();
      }

      @Override
      public void write(int b) throws IOException {
        baos.write(b);
      }

      @Override
      public void close() throws IOException {
        classData.put(className, baos.toByteArray());
        super.close();
      }
    }
  }

  /** Utility methods not directly related to the RuntimeCompiler */
  static class MethodInvocationUtils {
    /**
     * Utility method to find the first static method in the given
     * class that has the given name and can accept the given 
     * arguments. Returns <code>null</code> if no such method 
     * can be found.
     * 
     * @param c The class
     * @param methodName The name of the method
     * @param args The arguments
     * @return The first matching static method.
     */
    public static Method findMethod(Class<?> c, String methodName, Object ... args) {
      try {
        Method methods[] = c.getDeclaredMethods();
        for (Method m : methods) {
          if (m.getName().equals(methodName) && Modifier.isStatic(m.getModifiers())) {
            Class<?>[] parameterTypes = m.getParameterTypes();
            if (areAssignable(parameterTypes, args)) {
              return m;
            }
          }
        }
      } catch (Exception e) { }
      return null;
    }

    /**
     * Returns whether the given arguments are assignable to the
     * respective types
     * 
     * @param types The types
     * @param args The arguments
     * @return Whether the arguments are assignable
     */
    public static boolean areAssignable(Class<?> types[], Object ...args) {
      if (types.length != args.length) {
        return false;
      }
      for (int i=0; i<types.length; i++) {
        Object arg = args[i];
        Class<?> type = types[i];
        if (arg != null && !type.isAssignableFrom(arg.getClass())) {
          return false;
        }
      }
      return true;
    }
  }
  //4
  /** 
   * Console is a class for Processing that allows console text and user input 
   * to be displayed both in your Processing App and PDE/IDE console.
   * <p><details>
   * Sample code: constructor
    <code>
    	<pre>
Console console = new Console(500, 400, 13);
    	</pre>
    </code>
   * Sample code: console input using keyPressed
    <code>
    	<pre>
public void keyPressed() {
  if (key == CODED) {
    if (keyCode == 157) { // 157 is the command key's value
      commandPressed = true;
    }
  } else if (key == ENTER) {
    // println the input to display it on the console permanently
    console.println(console.input)
    // call your method that takes the input
    yourMethod(console.input);
    // reset the input string
    console.enter();
  } else if (key == 8) { // 8 is the delete key's value
    console.delete();
  } else if (!commandPressed) {
    console.input += key;
  } else if (key == 'v') {
    String text = console.getTextFromClipboard();
		console.input += text;
  }
}
    	</pre>
    </code>
</details><p>
   * @author Quinton Ashley
   */
  public class Console {
    // These variables can be edited at any time.
    public boolean visible = true;
    public int posX;
    public int posY;
    public int backColor;
    public int textColor;
    public int textPadding;
    public int textSize;
    public int lineHeight;
    public int lines;
    public String input = "";

    // Don't touch these variables unless you know what you're doing!
    private boolean update = false;
    private int logIndex = -1;
    private ByteArrayOutputStream baos = new ByteArrayOutputStream(16);
    private PGraphics g;
    private PrintStream stream = new PrintStream(baos);
    private String prevInput = "";
    private ArrayList<String> inputLog = new ArrayList<String>();

    public Console(int width, int height, int lines) {
      this(0, 0, width, height, color(0, 80), color(255, 190), lines);
    }
    
    /** Constructor method for a Console object
     * @param textColor use one of processing's color() methods to input textColor easily
     * @param textPadding space between surrounding text lines and the left and top edge of the console
     * @param textSize the size of the console text in the Processing window
     * @param lines the number of lines of text that will be displayed in the Processing window
     */
    public Console(
        int posX, int poxY,
        int width, int height, 
        int backColor, int textColor, int lines) {

      this.backColor = backColor;
      this.textColor = textColor;
      this.textSize = height/lines-height/lines/5-height/lines/5/lines;
      this.textPadding = height/lines/5;
      this.lineHeight = textSize+textPadding;
      this.lines = lines;
      this.g = createGraphics(width, height, P2D);
      this.g.textFont(createDefaultFont(textSize));
      this.g.textSize(textSize);
    }

    /** Functions the same as String.format(String format, Object... args)
     * @param format
     * @param args
     */
    public void printf(String format, Object... args) {
      try {
        stream.printf(format, args);
        System.out.printf(format, args);
      } catch (Exception e) {
        this.println("error: printf format exception");
      }
      update = true;
    }

    /** Functions the same as String.println(String string)
     * @param string
     */
    public void println(String string) {
      stream.println(string);
      System.out.println(string);
      update = true;
    }

    /** Functions the same as String.print(String string)
     * @param string
     */
    public void print(String string) {
      stream.print(string);
      System.out.print(string);
      update = true;
    }

    /**
     * Deletes one character from the input string, if the input string has a character to delete.
     * Call in the keyPressed() Processing method when key == 8
     */
    public void delete() {
      if (input.length() > 0) {
        input = input.substring(0, input.length()-1);
      }
    }
    
    public void enter() {
      if (input != null) {
        inputLog.add(input);
      }
      logIndex = -1;
      input = "";
    }
    
    public void upArrow() {
      if (inputLog.size() > 0) {
        if (logIndex <= 0) {
          logIndex = inputLog.size();
        }
        input = inputLog.get(--logIndex);
      }
    }
    
    public void downArrow() {
      if (inputLog.size() > 0) {
        if (logIndex >= inputLog.size()-1) {
          logIndex = -1;
        }
        input = inputLog.get(++logIndex);
      }
    }

    /**
     * Displays the console if visible is true.  Use in Processing's draw method.
     */
    public void draw() {
      if (visible) {
        if (update || !prevInput.equals(input)) {
          g.beginDraw();
          g.background(backColor);
          g.fill(textColor);
          g.textSize(textSize);
          String[] text = split(baos.toString(), "\n");
          int lastLine = (text[text.length-1].equals(""))? text.length-2 : text.length-1;
          int h = 1;
          // the on screen console will only show the most recent logs
          for (int i = (lastLine-lines >= 0)? lastLine-lines+1 : 0; i <= lastLine; i++, h++) {
            if (i < lastLine) {
              g.text(text[i], textPadding, h*textSize+h*textPadding);
            } else {
              g.text(text[i] + input, textPadding, h*textSize+h*textPadding);
            }
          }
          g.endDraw();
          prevInput = input;
          update = false;
        }
        image(g, posX, posY);
      }
    }

    /** Get's text from the clipboard, will print an error if the clipboard does not contain text.
     * @return the string from clipboard
     */
    public String getTextFromClipboard() {
      return (String) getFromClipboard(DataFlavor.stringFlavor);
    }

    /** This method is adapted from this 
     * <a href="https://forum.processing.org/one/topic/pasting-text-from-the-clipboard-into-processing.html">method</a>
     * on the Processing Forums.
     * @param flavor
     * @return obj
     */
    private Object getFromClipboard(DataFlavor flavor) {
      Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
      Transferable contents = clipboard.getContents(null);
      Object obj = null;
      if (contents != null && contents.isDataFlavorSupported(flavor)) {
        try {
          obj = contents.getTransferData(flavor);
        }
        catch (UnsupportedFlavorException exu) { // Unlikely but we must catch it
          this.println("Unsupported flavor: " + exu);
        }
        catch (java.io.IOException exi) {
          this.println("Unavailable data: " + exi);
        }
      }
      return obj;
    }

    /** This method copies String text to the clipboard
     * @param text the String to copy to the clipboard
     */
    public void copyToClipboard(String text) {
      Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
      StringSelection selection = new StringSelection(text);
      clipboard.setContents(selection, selection);
    }

    /**
     * <b>This method must be called before Processing's exit() method!</b>
     */
    public void close() {
      this.println("bye!");
      try {
        baos.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
      stream.close();
    }
  }

  public void exit() { //3
    console.close();
    super.exit();
  }
} //1