//@ts-nocheck

// Credit goes to https://gist.github.com/cbranch/260224a7e4699552d2dc
// Gets a JSDraw instance which renders to a PIXI graphics object.
// graphics: an instance of PIXI.Graphics
// scale: the scaling factor to convert from Box2D coordinates to screen pixels
import {Graphics} from "pixi.js";
import "../Box2D";
import {Box2DModule} from "../Box2D";

// TODO Make it non Pixi dependent (needs standard ChibiEngine Graphics)
export function getPIXIDebugDraw(Box2D: Box2DModule, graphics: Graphics, scale: number) {
  function getColorFromDebugDrawCallback(color) {
    const col = Box2D.wrapPointer(color, Box2D.b2Color);
    const red = (col.get_r() * 255 * 255 * 255) | 0;
    const green = (col.get_g() * 255 * 255) | 0;
    const blue = (col.get_b() * 255) | 0;
    return red + green + blue;
  }

  function drawSegment(graphics, vert1, vert2, color) {
    const vert1V = Box2D.wrapPointer(vert1, Box2D.b2Vec2);
    const vert2V = Box2D.wrapPointer(vert2, Box2D.b2Vec2);
    graphics.lineStyle(1, color, 1);
    graphics.moveTo(vert1V.get_x() * scale, vert1V.get_y() * scale);
    graphics.lineTo(vert2V.get_x() * scale, vert2V.get_y() * scale);
  }

  function drawPolygon(graphics, vertices, vertexCount, fill, color) {
    graphics.lineStyle(1, color, 1);
    if (fill) {
      graphics.beginFill(color, 0.5);
    }
    for (let tmpI = 0; tmpI < vertexCount; tmpI++) {
      const vert = Box2D.wrapPointer(vertices + (tmpI * 8), Box2D.b2Vec2);
      if (tmpI === 0)
        graphics.moveTo(vert.get_x() * scale, vert.get_y() * scale);
      else
        graphics.lineTo(vert.get_x() * scale, vert.get_y() * scale);
    }
    if (fill) {
      graphics.endFill();
    }
  }

  function drawCircle(graphics, center, radius, axis, fill, color) {
    const centerV = Box2D.wrapPointer(center, Box2D.b2Vec2);
    const axisV = Box2D.wrapPointer(axis, Box2D.b2Vec2);

    graphics.lineStyle(1, color, 1);
    if (fill) {
      graphics.beginFill(color, 0.5);
    }
    graphics.arc(centerV.get_x() * scale, centerV.get_y() * scale, radius * scale, 0, 2 * Math.PI, false);
    if (fill) {
      graphics.endFill();
    }

    if (fill) {
      //render axis marker
      const vert2V = new Box2D.b2Vec2(centerV.get_x(), centerV.get_y());
      vert2V.op_add(new Box2D.b2Vec2(axisV.get_x() * radius, axisV.get_y() * radius));
      graphics.moveTo(centerV.get_x() * scale, centerV.get_y() * scale);
      graphics.lineTo(vert2V.get_x() * scale, vert2V.get_y() * scale);
    }
  }

  function drawAxes(graphics, x, y, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newX = x * scale;
    const newY = y * scale;

    function transform(x, y) {
      return {x: x * cos + y * sin, y: -x * sin + y * cos};
    }

    const origin = transform(newX, newY);
    const xAxis = transform(newX + 100, newY);
    const yAxis = transform(newX, newY + 100);
    graphics.lineStyle(2, 'rgb(192,0,0)', 1);
    graphics.moveTo(origin.x, origin.y);
    graphics.lineTo(xAxis.x, xAxis.y);
    graphics.lineStyle(2, 'rgb(0,192,0)', 1);
    graphics.moveTo(origin.x, origin.y);
    graphics.lineTo(yAxis.x, yAxis.y);
  }

  function drawTransform(graphics: Graphics, transform) {
    const trans = Box2D.wrapPointer(transform, Box2D.b2Transform);
    const pos = trans.get_p();
    const rot = trans.get_q();
    drawAxes(graphics, pos.get_x(), pos.get_y(), rot.GetAngle());
  }

  const debugDraw = new Box2D.JSDraw();
  debugDraw.DrawSegment = function (vert1, vert2, color) {
    drawSegment(graphics, vert1, vert2, getColorFromDebugDrawCallback(color));
  };
  debugDraw.DrawPolygon = function (vertices, vertexCount, color) {
    drawPolygon(graphics, vertices, vertexCount, false, getColorFromDebugDrawCallback(color));
  };
  debugDraw.DrawSolidPolygon = function (vertices, vertexCount, color) {
    drawPolygon(graphics, vertices, vertexCount, true, getColorFromDebugDrawCallback(color));
  };
  debugDraw.DrawCircle = function (center, radius, color) {
    drawCircle(graphics, center, radius, new Box2D.b2Vec2(0, 0), false, getColorFromDebugDrawCallback(color));
  };
  debugDraw.DrawSolidCircle = function (center, radius, axis, color) {
    drawCircle(graphics, center, radius, axis, true, getColorFromDebugDrawCallback(color));
  };
  debugDraw.DrawTransform = function (transform) {
    drawTransform(graphics, transform);
  };
  debugDraw.DrawPoint = function (p, size, color) {
    drawCircle(graphics, p, size, new Box2D.b2Vec2(0, 0), true, getColorFromDebugDrawCallback(color));
  }
  return debugDraw;
}